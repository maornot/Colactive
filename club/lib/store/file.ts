import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Store } from "./index";
import { isListOpen, type GuestList, type Member } from "../types";

// Local-development store: a JSON file under .data/. Not for production —
// serverless hosts have no persistent disk.
type Data = {
  members: Member[];
  lists: GuestList[];
  signups: { listId: string; memberId: string; createdAt: string }[];
};

const file = path.join(process.cwd(), ".data", "club.json");

async function load(): Promise<Data> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return { members: [], lists: [], signups: [] };
  }
}

async function save(data: Data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Serialises writes so two simultaneous joins can't both take the last spot.
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(fn: (data: Data) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await load();
    const result = await fn(data);
    await save(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

const latest = (lists: GuestList[]) =>
  [...lists].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

export const fileStore: Store = {
  upsertMember: (input) =>
    mutate((data) => {
      const existing = data.members.find((m) => m.phone === input.phone);
      if (existing) {
        Object.assign(existing, input);
        return existing;
      }
      const member: Member = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
      data.members.push(member);
      return member;
    }),

  async getMember(id) {
    return (await load()).members.find((m) => m.id === id) ?? null;
  },

  async listMembers() {
    return (await load()).members.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getCurrentList() {
    return latest((await load()).lists);
  },

  createList: (input) =>
    mutate((data) => {
      const list: GuestList = { ...input, id: randomUUID(), closed: false, createdAt: new Date().toISOString() };
      data.lists.push(list);
      return list;
    }),

  closeList: (id) =>
    mutate((data) => {
      const list = data.lists.find((l) => l.id === id);
      if (list) list.closed = true;
    }),

  async countSignups(listId) {
    return (await load()).signups.filter((s) => s.listId === listId).length;
  },

  async hasSignup(listId, memberId) {
    return (await load()).signups.some((s) => s.listId === listId && s.memberId === memberId);
  },

  join: (listId, memberId) =>
    mutate((data) => {
      const list = data.lists.find((l) => l.id === listId);
      if (!list) return "missing";
      const signups = data.signups.filter((s) => s.listId === listId);
      if (signups.some((s) => s.memberId === memberId)) return "already";
      if (!isListOpen(list, 0)) return "closed";
      if (signups.length >= list.capacity) return "full";
      data.signups.push({ listId, memberId, createdAt: new Date().toISOString() });
      return "ok";
    }),

  async listSignups(listId) {
    const data = await load();
    return data.signups
      .filter((s) => s.listId === listId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .flatMap((s) => {
        const member = data.members.find((m) => m.id === s.memberId);
        return member ? [{ ...s, member }] : [];
      });
  },
};

import { env } from "../env";
import type { GuestList, GuestListInput, JoinResult, Member, MemberInput, Signup } from "../types";
import { fileStore } from "./file";
import { supabaseStore } from "./supabase";

export interface Store {
  upsertMember(input: MemberInput): Promise<Member>;
  getMember(id: string): Promise<Member | null>;
  listMembers(): Promise<Member[]>;
  getCurrentList(): Promise<GuestList | null>;
  createList(input: GuestListInput): Promise<GuestList>;
  closeList(id: string): Promise<void>;
  countSignups(listId: string): Promise<number>;
  hasSignup(listId: string, memberId: string): Promise<boolean>;
  /** Atomically adds the member unless the list is closed, expired or full. */
  join(listId: string, memberId: string): Promise<JoinResult>;
  listSignups(listId: string): Promise<Signup[]>;
}

export const usingSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

export function getStore(): Store {
  if (usingSupabase) return supabaseStore(env.supabaseUrl!, env.supabaseServiceRoleKey!);
  if (process.env.VERCEL) {
    throw new Error("No database configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return fileStore;
}

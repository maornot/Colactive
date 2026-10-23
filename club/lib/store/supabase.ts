import { createClient } from "@supabase/supabase-js";
import type { Store } from "./index";
import type { GuestList, JoinResult, Member } from "../types";

type MemberRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  instagram: string;
  age: number;
  created_at: string;
};

type ListRow = {
  id: string;
  title: string;
  details: string;
  event_at: string | null;
  closes_at: string;
  capacity: number;
  closed: boolean;
  created_at: string;
};

const toMember = (r: MemberRow): Member => ({
  id: r.id,
  fullName: r.full_name,
  phone: r.phone,
  email: r.email,
  instagram: r.instagram,
  age: r.age,
  createdAt: r.created_at,
});

const toList = (r: ListRow): GuestList => ({
  id: r.id,
  title: r.title,
  details: r.details,
  eventAt: r.event_at,
  closesAt: r.closes_at,
  capacity: r.capacity,
  closed: r.closed,
  createdAt: r.created_at,
});

function check<T>({ data, error }: { data: T; error: { message: string } | null }) {
  if (error) throw new Error(error.message);
  return data;
}

export function supabaseStore(url: string, serviceRoleKey: string): Store {
  const db = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    async upsertMember(input) {
      const row = check(
        await db
          .from("club_members")
          .upsert(
            {
              full_name: input.fullName,
              phone: input.phone,
              email: input.email,
              instagram: input.instagram,
              age: input.age,
            },
            { onConflict: "phone" }
          )
          .select()
          .single()
      );
      return toMember(row as MemberRow);
    },

    async getMember(id) {
      const row = check(await db.from("club_members").select().eq("id", id).maybeSingle());
      return row ? toMember(row as MemberRow) : null;
    },

    async listMembers() {
      const rows = check(await db.from("club_members").select().order("created_at", { ascending: false }));
      return (rows as MemberRow[]).map(toMember);
    },

    async getCurrentList() {
      const row = check(
        await db.from("club_lists").select().order("created_at", { ascending: false }).limit(1).maybeSingle()
      );
      return row ? toList(row as ListRow) : null;
    },

    async createList(input) {
      const row = check(
        await db
          .from("club_lists")
          .insert({
            title: input.title,
            details: input.details,
            event_at: input.eventAt,
            closes_at: input.closesAt,
            capacity: input.capacity,
          })
          .select()
          .single()
      );
      return toList(row as ListRow);
    },

    async closeList(id) {
      check(await db.from("club_lists").update({ closed: true }).eq("id", id));
    },

    async countSignups(listId) {
      const { count, error } = await db
        .from("club_signups")
        .select("*", { count: "exact", head: true })
        .eq("list_id", listId);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async hasSignup(listId, memberId) {
      const row = check(
        await db.from("club_signups").select("list_id").eq("list_id", listId).eq("member_id", memberId).maybeSingle()
      );
      return Boolean(row);
    },

    async join(listId, memberId) {
      const result = check(await db.rpc("club_join_list", { p_list: listId, p_member: memberId }));
      return result as JoinResult;
    },

    async listSignups(listId) {
      const rows = check(
        await db
          .from("club_signups")
          .select("list_id, member_id, created_at, club_members(*)")
          .eq("list_id", listId)
          .order("created_at")
      );
      return (rows as unknown as { list_id: string; member_id: string; created_at: string; club_members: MemberRow }[]).map(
        (r) => ({ listId: r.list_id, memberId: r.member_id, createdAt: r.created_at, member: toMember(r.club_members) })
      );
    },
  };
}

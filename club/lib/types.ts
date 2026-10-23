export type Member = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  instagram: string;
  age: number;
  createdAt: string;
};

export type MemberInput = Omit<Member, "id" | "createdAt">;

export type GuestList = {
  id: string;
  title: string;
  details: string;
  eventAt: string | null;
  closesAt: string;
  capacity: number;
  closed: boolean;
  createdAt: string;
};

export type GuestListInput = Pick<GuestList, "title" | "details" | "eventAt" | "closesAt" | "capacity">;

export type Signup = { listId: string; memberId: string; createdAt: string; member: Member };

export type JoinResult = "ok" | "already" | "closed" | "full" | "missing";

export const DEFAULT_CAPACITY = 40;

export function isListOpen(list: GuestList, count: number, now = Date.now()) {
  return !list.closed && now < Date.parse(list.closesAt) && count < list.capacity;
}

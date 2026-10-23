import { cookies } from "next/headers";
import { getStore } from "./store";
import { MEMBER_COOKIE, verify } from "./session";
import { isListOpen } from "./types";

export async function getListState() {
  const store = getStore();
  const [list, memberId] = await Promise.all([
    store.getCurrentList(),
    cookies().then((jar) => verify("member", jar.get(MEMBER_COOKIE)?.value)),
  ]);
  if (!list) return null;
  const [count, joined] = await Promise.all([
    store.countSignups(list.id),
    memberId ? store.hasSignup(list.id, memberId) : false,
  ]);
  return { list, count, joined, open: isListOpen(list, count) };
}

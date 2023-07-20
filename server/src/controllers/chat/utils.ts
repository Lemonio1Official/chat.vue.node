import db from "../../db";

export type chat = { id: number; title: string; members: string[]; lastMessage: { text: string; time: number; owner_id: number } };
export async function getChat(chat: chat, id: number, res, cnickname?: string) {
  const chats = (await db.query(`select chats from users where id = $1`, [id])).rows[0];
  if (!chats) return res.json({ message: "User not found" });
  chat.title = cnickname;
  await db.query(`update users set chats = $1 where id = $2`, [JSON.stringify(Array.from(new Set([chat.id, ...chats.chats]))), id]);
  res.json({ data: chat });
}
export async function chat2Top(chat_id: number) {
  const members = (await db.query(`select members from chats where id = $1`, [chat_id])).rows[0];
  if (!members) return false;
  const [user, user2] = (await db.query(`select id, chats from users where id = $1 or id = $2`, members.members)).rows;
  if (!user || !user2) return false;
  db.query(`update users set chats = $1 where id = $2`, [JSON.stringify(Array.from(new Set([chat_id, ...user.chats]))), user.id]);
  db.query(`update users set chats = $1 where id = $2`, [JSON.stringify(Array.from(new Set([chat_id, ...user2.chats]))), user2.id]);
  return true;
}

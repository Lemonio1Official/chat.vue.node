import db from "../../db";
import { Func, IUser } from "../../utils/types";
import { emitter } from "./subscribes";
import { getChat, chat2Top } from "./utils";

export const create: Func<{ user: IUser }> = async (req, res) => {
  const companion = (await db.query(`select id, nickname from users where uid = $1`, [req.params.uid])).rows[0];
  if (!companion) return res.json({ message: "User not found" });
  const members = [req.user.id, companion.id].sort((a, b) => a - b);
  const used = (await db.query(`select * from chats where members::text = $1`, [JSON.stringify(members)])).rows[0];
  if (used) return await getChat(used, req.user.id, res, companion.nickname);
  const chat = (
    await db.query(`insert into chats (members, lastMessage) values ($1, $2) returning *`, [
      JSON.stringify(members),
      JSON.stringify({}),
    ])
  ).rows[0];
  if (!chat) return res.json({ message: "Something went wrong" });
  await getChat(chat, req.user.id, res, companion.nickname);
};
export const getUser: Func<{ user: IUser }> = async (req, res) => {
  const chat = (await db.query(`select members from chats where id = $1`, [req.params.id])).rows[0];
  if (!chat) return res.json({ message: "Chat not found" });
  const companionUID = chat.members.filter((i) => i !== req.user.id)[0];
  const companion = (await db.query(`select * from users where id = $1`, [companionUID])).rows[0];
  if (!companion) return res.json({ message: "User not found" });
  res.json({ data: companion });
};
export const sendMessage: Func<{ user: IUser }> = async (req, res) => {
  const { message, chat_id, companionID } = req.body;
  const mess = (
    await db.query(`insert into messages (message, owner_id, chat_id, status, time) values ($1, $2, $3, $4, $5) returning *`, [
      message,
      req.user.id,
      chat_id,
      "sended",
      Date.now(),
    ])
  ).rows[0];
  if (!mess) return res.json({ message: "Sending error" });
  mess.time = Number(mess.time);
  emitter.emit(`message${chat_id}`, mess);
  mess.title = req.user.nickname;
  if (companionID) emitter.emit(`onChatChange${companionID}`, mess, req.user.id);
  if (!(await chat2Top(chat_id))) return res.json({ message: "Chatup error" });
  await db.query(`update chats set lastmessage = $1 where id = $2`, [JSON.stringify(mess), chat_id]);
  mess.mine = true;
  res.json({ data: mess });
};
export const getMessages: Func<{ user: IUser }> = async (req, res) => {
  const messages = (await db.query(`select * from messages where chat_id = $1 ORDER BY time ASC;`, [req.params.id])).rows;
  for (const i of messages) {
    i.time = Number(i.time);
    i.mine = i.owner_id === req.user.id;
    delete i.owner_id;
  }
  res.json({ data: messages });
};

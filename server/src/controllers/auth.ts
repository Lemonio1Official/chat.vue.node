import jwt from "jsonwebtoken";
import bc from "bcryptjs";
import db from "../db";
import { Func, IUser } from "../utils/types";

export const create: Func = async (req, res) => {
  const { uid, nickname, password } = req.body;
  const used = await db.query(`SELECT * from users where uid = $1`, [uid]);
  if (used.rows[0]) return res.json({ message: "Identifier already exists" });
  const hash = bc.hashSync(password, bc.genSaltSync(10));
  const user = (await db.query(`INSERT INTO users (uid, nickname, password) values ($1, $2, $3) returning *`, [uid, nickname, hash]))
    .rows[0];
  if (!user) return res.json({ message: "Something went wrong" });
  const token = jwt.sign({ id: user.id }, "2005", { expiresIn: "7d" });
  res.json({ data: user, token, message: "Successful registration" });
};

export const login: Func = async (req, res) => {
  const { uid, password } = req.body;
  const user = (await db.query(`select * from users where uid = $1`, [uid])).rows[0];
  if (!user) return res.json({ message: "User not found" });
  if (!bc.compareSync(password, user.password)) return res.json({ message: "Invalid password" });
  const token = jwt.sign({ id: user.id }, "2005", { expiresIn: "7d" });
  const chats = [];
  for (const i of user.chats) {
    const chat = await getChat(i, user.id);
    if (chat) chats.push(chat);
  }
  user.chats = chats;
  res.json({ data: user, token, message: "Successful authorization" });
};

export const getMe: Func<{ user: IUser }> = async (req, res) => {
  const chats = [];
  for (const i of req.user.chats) {
    const chat = await getChat(i, req.user.id);
    if (chat) chats.push(chat);
  }
  req.user.chats = chats;
  res.json({ data: req.user });
};

async function getChat(chatId: number, userId: number) {
  const chat = (await db.query(`select * from chats where id = $1`, [chatId])).rows[0];
  if (!chat) return false;
  const members = (await db.query(`select members from chats where id = $1`, [chat.id])).rows[0];
  if (!members) return false;
  const companionId = members.members.filter((i) => i !== userId)[0];
  const companion = (await db.query(`select nickname from users where id = $1`, [companionId])).rows[0];
  if (!companion) return false;
  chat.title = companion.nickname;
  if (!chat.lastmessage.time) delete chat.lastmessage;
  else {
    chat.lastmessage.mine = chat.lastmessage.owner_id === userId;
    delete chat.lastmessage.owner_id;
  }
  return chat;
}

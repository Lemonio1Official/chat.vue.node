import db from "../../db";
import { Func, IUser } from "../../utils/types";
import { emitter } from "./subscribes";

export const checkMessage: Func<{ user: IUser }> = async (req, res) => {
  const { messages, companionID } = req.body;
  let lastMess = null;
  for (const i of messages) {
    lastMess = (
      await db.query(`update messages set status = $1 where time = $2 and chat_id = $3 returning *`, ["checked", i, req.params.id])
    ).rows[0];
  }
  emitter.emit(`message${req.params.id}`, messages);
  lastMess.time = Number(lastMess.time);
  db.query("update chats set lastmessage = $1 where id = $2", [lastMess, req.params.id]);
  emitter.emit(`onChatChange${companionID}`, lastMess, req.user.id);
  res.status(200).end();
};
export const editMessage: Func<{ user: IUser }> = async (req, res) => {
  const { message, time } = req.body;
  await db.query(`update messages set message = $1 where time = $2 and chat_id = $3`, [message, time, req.params.id]);
  emitter.emit(`message${req.params.id}`, { message, time, edited: true, editor: req.user.id });
  res.status(200).end();
};
export const deleteMessage: Func<{ user: IUser }> = async (req, res) => {
  const { time, forAll, lastMess, companionID } = req.body;
  if (forAll) {
    await db.query("delete from messages where time = $1 and chat_id = $2", [time, req.params.id]);
    emitter.emit(`message${req.params.id}`, { time, deleted_: true, deleter: req.user.id });
    delete lastMess.mine;
    db.query("update chats set lastmessage = $1 where id = $2", [lastMess, req.params.id]);
    emitter.emit(`onChatChange${companionID}`, lastMess, req.user.id);
  } else {
    const deleted = (await db.query("select deleted from messages where time = $1 and chat_id = $2", [time, req.params.id])).rows[0];
    if (!deleted) return res.json({ message: "Message not found" });
    deleted.deleted.push(req.user.id);
    await db.query("update messages set deleted = $1 where time = $2 and chat_id = $3", [
      JSON.stringify(deleted.deleted),
      time,
      req.params.id,
    ]);
  }
};

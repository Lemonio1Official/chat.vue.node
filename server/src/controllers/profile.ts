import events from "events";
import db from "../db";
import { Func, IUser } from "./../utils/types";

const emitter = new events.EventEmitter();
emitter.setMaxListeners(1000);

export const edit: Func<{ user: IUser }> = async (req, res) => {
  const field = Object.keys(req.body)[0];
  const resp = (await db.query(`update users set ${field} = $1 where id = $2 RETURNING ${field}`, [req.body[field], req.user.id]))
    .rows[0];
  if (!resp) return res.json({ message: "Updating error" });
  res.json({ data: resp, message: `${field} successful changed` });
};

export const search: Func = async (req, res) => {
  const { uid } = req.params;
  const users = (await db.query(`select * from users`)).rows;
  const found = [];
  for (const i of users) Math.floor(i.uid.length * 0.55) < uid.length && i.uid.indexOf(uid) > -1 && found.push(i);
  res.json({ data: found });
};

export const lastVisit: Func<{ user: IUser }> = async (req, res) => {
  let visit = 0;
  if (!req.query.truth) visit = Date.now();
  emitter.emit(`visit${req.user.uid}`, visit);
  db.query(`update users set visit = $1 where id = $2`, [visit, req.user.id]);
  res.status(200).end();
};

export const getUserProfile: Func<{ user: IUser }> = async (req, res) => {
  const user = (await db.query(`select * from users where uid = $1`, [req.params.uid])).rows[0];
  if (!user) return res.json({ message: "User not found" });
  res.json({ data: user });
};

export const subscribeVisit: Func<{ user: IUser }> = async (req, res) => {
  let cancel = false;
  emitter.once("visitCancel" + req.user.id, () => {
    if (cancel) return;
    cancel = true;
    res.json({ cancel });
  });
  emitter.once(`visit${req.params.uid}`, (visit) => {
    if (cancel) return;
    cancel = true;
    res.json({ visit });
  });
};

export const subUserVisitCancel: Func<{ user: IUser }> = async (req, res) => {
  emitter.emit("visitCancel" + req.user.id);
  res.status(200).end();
};

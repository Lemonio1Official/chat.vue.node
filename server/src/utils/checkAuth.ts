import jwt from "jsonwebtoken";
import db from "../db";
import { Func, IUser } from "./types";

export const checkAuth: Func<{ user: IUser }> = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.json({ message: "Access denied" });

  try {
    const { id } = jwt.verify(token, "2005");
    const user = (await db.query(`SELECT * from users where id = $1`, [id])).rows[0];
    if (!user) return res.json({ message: "User not found" });
    req.user = user;
    next();
  } catch (_) {
    res.json({ message: "Invalid token" });
  }
};

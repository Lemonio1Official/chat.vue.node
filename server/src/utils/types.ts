import { Request, Response } from "./../../lib/server";
export type Func<T = void> = (req: Request & T, res: Response, next?: () => void) => void;

export interface IUser {
  id: number;
  uid: string;
  nickname: string;
  password: string;
  visit: number;
  chats: number[];
}

import axios from "../../utils/axios";
import { createSlice } from "../script";
import { chatsSubscribe } from "../../utils/subscribes";

export type USER = {
  id: number;
  uid: string;
  nickname: string;
  visit: number;
  chats: CHAT[];
};

export type CHAT = {
  id: number;
  title: string;
  lastmessage: { message: string; time: number; mine: boolean; status?: "sending" | "sended" | "checked" };
};

export interface IUser {
  user: USER;
  status: "pending" | boolean;
}

const state: IUser = {
  user: {
    id: 0,
    uid: "",
    nickname: "",
    visit: 0,
    chats: [],
  },
  status: false,
};

const userSlice = createSlice({
  name: "user",
  state,
  reducers: {
    setUser(s, p) {
      s.user = p[0];
      s.status = true;
      window.onfocus = () => axios.get("/profile/offline?truth=false");
      window.onblur = () => axios.get("/profile/offline");
      chatsSubscribe(p[1]);
    },
    setStatus(s, p) {
      s.status = p;
    },
    edit(s, p) {
      s.user[p[0]] = p[1];
    },
    addChat(s, p) {
      if (s.user.chats.find((i) => i.id === p.id)) return;
      s.user.chats = [p, ...s.user.chats];
    },
    setLastMessage(s, p) {
      let chat: CHAT = {} as any;
      if (!s.user.chats.find((i) => i.id === p.chat_id)) chat = { id: p.chat_id, title: p.title, lastmessage: p };
      s.user.chats = s.user.chats.filter((i) => {
        if (i.id === p.chat_id) {
          i.lastmessage = p;
          chat = i;
          return false;
        }
        return true;
      });
      s.user.chats.unshift(chat);
    },
    logout(s) {
      s.user = { id: 0, uid: "", nickname: "", visit: s.user.visit, chats: [] };
      s.status = false;
      //window
      window.onfocus = window.onblur = null;
      axios.get("/profile/offline").then(() => localStorage.removeItem("token"));
    },
  },
});

export default userSlice;

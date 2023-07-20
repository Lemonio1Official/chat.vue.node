import axios from "./axios";

export function visitSubscribe(This, uid) {
  axios
    .get(`/profile/subscribe/visit/${uid}`)
    .then(({ data }) => {
      if (data.cancel) return;
      if (!(This.$route.path === "/user/" + uid) && !(This.$route.path === `/chat/${This.$route.params.id}`)) return;
      typeof data.visit !== "undefined" && This.user && (This.user.visit = data.visit);
      visitSubscribe(This, uid);
    })
    .catch((_) => {
      if (!(This.$route.path === "/user/" + uid) && !(This.$route.path === `/chat/${This.$route.params.id}`)) return;
      setTimeout(() => visitSubscribe(This, uid), 500);
    });
}
export function messageSubscribe(This) {
  axios
    .get(`/chat/subscribe/message/${This.$route.params.id}`)
    .then(({ data }) => {
      if (data.cancel) return;
      if (data.data) {
        This.messages.push(data.data);
        setTimeout(This.onNewMess);
      } else if (data.checked) {
        This.checked = data.checked[0];
        for (const t of data.checked) {
          const mess = This.messages.find((i) => i.time === t);
          if (mess) mess.status = "checked";
        }
      } else if (data.edited) {
        This.messages.find((m) => m.time === data.edited.time).message = data.edited.message;
      } else if (data.deleted_) {
        This.messages = This.messages.filter((m) => m.time !== data.deleted_.time);
      }
      messageSubscribe(This);
    })
    .catch((_) => {
      if (This.$route.path !== "/chat/" + This.$route.params.id) return;
      setTimeout(() => messageSubscribe(This), 500);
    });
}
export function chatsSubscribe(This) {
  axios
    .get("/chat/subscribe/chats")
    .then(({ data }) => {
      if (!data.data) return;
      data.data.time = Number(data.data.time);
      This.$store.commit("user.setLastMessage", data.data);
      chatsSubscribe(This);
    })
    .catch((_) => setTimeout(chatsSubscribe, 500));
}

import events from "events";
import { Func, IUser } from "../../utils/types";

export const emitter = new events.EventEmitter();
emitter.setMaxListeners(1000);

export const subscribeMessage: Func<{ user: IUser }> = async (req, res) => {
  let cancel = false;
  emitter.once(`messCancel${req.user.id}`, () => {
    if (cancel) return;
    cancel = true;
    res.json({ cancel });
  });
  function onmess(mess_) {
    if (cancel) return;
    if (mess_.deleted_) {
      if (mess_.deleter === req.user.id) return emitter.once(`message${req.params.id}`, onmess);
      cancel = true;
      return res.json({ deleted_: mess_ });
    }
    if (mess_.edited) {
      if (mess_.editor === req.user.id) return emitter.once(`message${req.params.id}`, onmess);
      cancel = true;
      return res.json({ edited: mess_ });
    }
    if (Array.isArray(mess_)) {
      cancel = true;
      return res.json({ checked: mess_ });
    }
    const mess = JSON.parse(JSON.stringify(mess_));
    if (cancel) return;
    if (mess.owner_id === req.user.id) return emitter.once(`message${req.params.id}`, onmess);
    mess.mine = mess.owner_id === req.user.id;
    delete mess.owner_id;
    cancel = true;
    res.json({ data: mess });
  }
  emitter.once(`message${req.params.id}`, onmess);
};
export const cancelSubMessage: Func<{ user: IUser }> = async (req, res) => {
  emitter.emit(`messCancel${req.user.id}`);
  res.status(200).end();
};
export const subChats: Func<{ user: IUser }> = async (req, res) => {
  let cancel = false;
  emitter.once(`subChatsCancel${req.user.id}`, () => {
    if (cancel) return;
    cancel = true;
    res.json({ cancel });
  });
  function on(mess, changerID: number) {
    if (cancel) return;
    if (mess.status === "checked") {
      cancel = true;
      mess.mine = mess.owner_id === req.user.id;
      return res.json({ data: mess });
    }
    if (changerID === req.user.id) return emitter.once(`onChatChange${req.user.id}`, on);
    cancel = true;
    res.json({ data: mess });
  }
  emitter.once(`onChatChange${req.user.id}`, on);
};
export const cancelSubChats: Func<{ user: IUser }> = async (req, res) => {
  emitter.emit(`subChatsCancel${req.user.id}`);
  res.status(200).end();
};

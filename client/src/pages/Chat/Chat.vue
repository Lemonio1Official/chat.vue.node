<script lang="ts">
import s from "./chat.module.scss";
import axios from "../../utils/axios";
import Hat from "../../components/Hat/Hat.vue";
import type { USER } from "../../store/slices/userSlice";
import { messageTime } from "../../utils/getTime";
import { $$ } from "../../store/script";
import { messageSubscribe } from "../../utils/subscribes";

type message = { message: string; time: number; mine: boolean; status: "sending" | "sended" | "checked"; deleted: number[] };
interface data {
  messages: message[];
  message: string;
  user: USER | null;
  rows: number;
  checked: number;
  messAction: {
    editing: boolean;
    mess: message | null;
    deleting: boolean;
    forAll: boolean;
  };
  s: CSSModuleClasses;
}
export default {
  name: "chat",
  components: { Hat },
  data(): data {
    return {
      messages: [],
      message: "",
      user: null,
      rows: 1,
      checked: 0,
      messAction: {
        editing: false,
        mess: null,
        deleting: false,
        forAll: false,
      },
      s,
    };
  },
  methods: {
    onMessInp() {
      const countRows = this.message.split("\n");
      this.rows = countRows.length > 4 ? 4 : countRows.length;
    },
    sendMess(onenter: any = false) {
      this.messages.push({
        message: this.message,
        time: Date.now(),
        mine: true,
        status: "sending",
        deleted: [],
      });
      axios
        .post("/chat/send/message", {
          message: this.message,
          chat_id: Number(this.$route.params.id),
          companionID: this.user?.id,
        })
        .then(({ data }) => {
          if (onenter) (this.message = ""), (this.rows = 1);
          if (!data.data) return;
          this.messages.pop();
          this.messages.push(data.data);
          if (this.checked === data.data.time) data.data.status = "checked";

          this.$store.commit("user.setLastMessage", data.data);
          setTimeout(() => {
            const height = (this.$refs.chatZone as HTMLDivElement).querySelector("ul")?.offsetHeight;
            if (height) (this.$refs.chatZone as HTMLDivElement).scrollTop = height;
          });
        });
      this.message = "";
      this.rows = 1;
    },
    checkMess(e) {
      if (!this.$refs.chatZone) return;
      const ul = (this.$refs.chatZone as HTMLDivElement).querySelector("ul");
      if (!ul) return;
      const lies = ul.querySelectorAll(".sended") as any as HTMLLIElement[];
      const checked: number[] = [];
      for (const li of lies) {
        const realScroll = (this.$refs.chatZone as any).scrollTop + e.deltaY;
        const scroll = realScroll + (this.$refs.chatZone as any).offsetHeight;
        // middle of li relative chatZone
        const posYofChat = li.offsetTop + li.offsetHeight / 2 - ((this.$refs.hat as any).$el as HTMLDivElement).offsetHeight;
        if (scroll > posYofChat && realScroll < posYofChat) {
          const time = li.getAttribute("time");
          if (time) {
            checked.push(Number(time));
            li.classList.remove("sended");
          }
        }
      }
      if (!checked.length || !this.user) return;
      axios.post(`/chat/message/check/${this.$route.params.id}`, {
        messages: checked,
        companionID: this.user.id,
      });
    },
    messActionHandler(e: MouseEvent, mess: message) {
      this.messAction.mess = mess;
      let elem = e.target as HTMLElement | null;
      while (elem === null || elem.tagName !== "LI") if (elem) elem = elem.parentElement;
      if (!elem) return;
      const minY = ((this.$refs.hat as any).$el as HTMLDivElement).offsetHeight + 5;
      const maxY =
        window.innerHeight -
        (this.$refs.messAction as HTMLDivElement).offsetHeight -
        (this.$refs.messageArea as HTMLDivElement).offsetHeight -
        20;
      (this.$refs.messAction as HTMLDivElement).style.left = elem.offsetLeft + (mess.mine ? 0 : elem.offsetWidth) + "px";
      (this.$refs.messAction as HTMLDivElement).style.top = (e.y < minY ? minY : e.y > maxY ? maxY : e.y) + "px";
      (this.$refs.messAction! as HTMLDivElement).focus();
    },
    maCopy() {
      if (this.messAction.mess) navigator.clipboard.writeText(this.messAction.mess.message);
      this.closeMA();
    },
    maEdit() {
      if (!this.messAction.mess) return;
      this.messAction.editing = true;
      this.message = this.messAction.mess.message;
      this.rows = this.message.split("\n").length;
      this.closeMA();
      (this.$refs.messageArea as HTMLTextAreaElement).focus();
    },
    editMess(onenter: any = false) {
      if (!this.messAction.mess) return;
      if (this.message === this.messAction.mess.message) return;
      const [message, time] = [this.message, this.messAction.mess.time];
      this.message = "";
      this.messAction.editing = false;
      const editedMess = this.messages.find((m) => m.time === time);
      if (editedMess) editedMess.message = message;
      axios.post(`/chat/message/edit/${this.$route.params.id}`, { message, time }).then(() => {
        if (onenter) (this.message = ""), (this.rows = 1);
      });
    },
    maDelete() {
      this.messAction.deleting = true;
      this.closeMA();
    },
    deleteMess() {
      if (!this.messAction.mess || !this.user) return;
      const [forAll, time] = [this.messAction.forAll, this.messAction.mess.time];
      this.messages = this.messages.filter((m) => m.time !== time);
      const lastMess = this.messages[this.messages.length - 1] as any;
      lastMess.chat_id = Number(this.$route.params.id);
      lastMess.owner_id = lastMess.mine ? this.$$.user.user.id : this.user.id;
      lastMess.title = this.user.nickname;
      this.$store.commit("user.setLastMessage", lastMess);
      this.messAction.deleting = false;
      this.messAction.forAll = false;
      axios.post(`/chat/message/delete/${this.$route.params.id}`, {
        time,
        forAll,
        lastMess,
        companionID: this.user.id,
      });
    },
    closeMA() {
      (this.$refs.messAction as HTMLDivElement).style.left = "-100%";
    },
    onNewMess() {
      const height = (this.$refs.chatZone as HTMLDivElement)?.querySelector("ul")?.offsetHeight;
      if (height) (this.$refs.chatZone as HTMLDivElement).scrollTop = height;
      this.checkMess({ deltaY: 0 });
    },
    messageTime,
  },
  computed: {
    $$,
  },
  mounted() {
    window.oncontextmenu = (e) => e.preventDefault();
    axios.get(`/chat/getUser/${this.$route.params.id}`).then(({ data }) => {
      if (data.data) this.user = data.data;
      else {
        this.$store.commit("toast.set", data.message);
        this.$router.replace("/");
      }
    });
    axios.get(`/chat/get/messages/${this.$route.params.id}`).then(({ data }) => {
      this.messages = data.data.filter((m) => !m.deleted.find((id) => id === this.$$.user.user.id));
      messageSubscribe(this);
      this.$store.commit("interval.setOnRoute", () => {
        window.oncontextmenu = null;
        axios.get("/chat/subscribe/cancel/message");
      });
      setTimeout(this.onNewMess);
    });
    setTimeout(() => {
      let shiftDown = false;
      const input = this.$refs.messageArea as HTMLTextAreaElement;
      input.onkeydown = (e) => {
        if (e.key === "Shift") shiftDown = true;
        if (shiftDown && e.key === "Enter") this.messAction.editing ? this.editMess(true) : this.sendMess(true);
      };
      input.onkeyup = (e) => e.key === "Shift" && (shiftDown = false);
    });
  },
};
</script>
<template>
  <Hat v-if="user" :text="user?.nickname" :uid="user.uid" ref="hat" />
  <div :class="s.chat">
    <div :class="s.messActions" tabindex="0" ref="messAction" @blur="closeMA">
      <span @click="maCopy"><i class="fa-solid fa-copy" />Copy</span>
      <span @click="maEdit"><i class="fa-solid fa-pen" />Edit</span>
      <span @click="maDelete"><i class="fa-solid fa-trash" />Delete</span>
    </div>
    <div :class="s.chatZone" ref="chatZone" @wheel="checkMess">
      <ul>
        <li
          v-for="(i, ind) of messages"
          :key="ind"
          :class="`${i.mine ? s.mine : i.status === 'sended' && 'sended'}`"
          :time="i.time"
          @contextmenu="(e) => messActionHandler(e, i)"
        >
          {{ i.message }}
          <span>
            {{ messageTime(i.time) }}
            <i
              v-if="i.mine"
              :class="`fa-solid fa-check${i.status === 'sending' ? '' : '-double'} ${i.status === 'checked' && s.checked}`"
            />
          </span>
        </li>
      </ul>
    </div>
    <div :class="s.sendZone">
      <textarea :rows="rows" @input="onMessInp" ref="messageArea" v-model="message" placeholder="Message"></textarea>
      <i class="fa-solid fa-paper-plane" v-if="!messAction.editing" :class="s.send" @click="sendMess" />
      <i class="fa-solid fa-check-circle" v-if="messAction.editing" :class="s.send" @click="editMess" />
    </div>
  </div>
  <div :class="s.blockBG" v-if="messAction.deleting"></div>
  <div :class="s.deletePopup" v-if="messAction.deleting">
    <label>
      <input type="checkbox" v-model="messAction.forAll" />
      Delete for everyone
    </label>
    <div>
      <button @click="deleteMess">Confirm</button>
      <button @click="messAction.deleting = false">Cancel</button>
    </div>
  </div>
</template>
<style src="./chat.module.scss" lang="scss" />

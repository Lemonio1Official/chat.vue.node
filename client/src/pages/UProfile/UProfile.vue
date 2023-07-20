<script lang="ts">
import { $$ } from "../../store/script";
import axios from "../../utils/axios";
import Hat from "../../components/Hat/Hat.vue";
import { getLastVisit } from "../../utils/getTime";
import { visitSubscribe } from "../../utils/subscribes";
import type { USER } from "../../store/slices/userSlice";
import s from "./uprofile.module.scss";

interface data {
  itv: number;
  user: USER | null;
  s: CSSModuleClasses;
}
export default {
  name: "uprofile",
  components: { Hat },
  data(): data {
    return {
      itv: 0,
      user: null,
      s,
    };
  },
  methods: {
    getLastVisit,
    openChat() {
      if (!this.user) return;
      axios.post(`/chat/create/${this.user.uid}`).then(({ data }) => {
        if (data.data) {
          this.$store.commit("user.addChat", data.data);
          this.$router.push("/chat/" + data.data.id);
        } else this.$store.commit("toast.set", data.message);
      });
    },
  },
  computed: {
    $$,
  },
  mounted() {
    axios.get(`/profile/getUser/${this.$route.params.uid}`).then(({ data }) => {
      if (data.data) {
        this.user = data.data;
        visitSubscribe(this, this.$route.params.uid);
        this.$store.commit("interval.setOnRoute", () => {
          axios.get("/profile/subscribe/cancel/visit");
        });
      } else {
        this.$store.commit("toast.set", data.message);
        this.$router.replace("/");
      }
    });
    clearInterval(this.itv);
    this.itv = setInterval(() => {
      if (!this.user) return;
      this.user = JSON.parse(JSON.stringify(this.user));
    }, 50000);
    this.$store.commit("interval.setOnRoute", () => {
      clearInterval(this.itv);
    });
  },
};
</script>
<template>
  <Hat :text="user?.nickname" />
  <div :class="s.uprofile" v-if="user">
    <div :class="s.user">
      <i :class="s.avatar">{{ user.nickname[0] }}</i>
      <span :class="s.uid">@{{ user.uid }}</span>
      <span :class="`${s.visit} ${getLastVisit(Number(user.visit)) === 'online' && s.online}`"
        ><s>Last visit: </s>{{ getLastVisit(Number(user.visit)) }}</span
      >
    </div>
    <div :class="s.actions">
      <button @click="openChat">Write a message</button>
      <button>Block user</button>
    </div>
  </div>
</template>
<style src="./uprofile.module.scss" lang="scss" />

<script lang="ts">
import s from "./hat.module.scss";
import { visitSubscribe } from "../../utils/subscribes";
import { getLastVisit } from "../../utils/getTime";
import axios from "../../utils/axios";

interface data {
  user: {
    visit: number;
  };
  s: CSSModuleClasses;
}
export default {
  name: "hat",
  props: {
    text: String,
    uid: String,
  },
  data(): data {
    return {
      user: {
        visit: 0,
      },
      s,
    };
  },
  methods: {
    getLastVisit,
  },
  mounted() {
    axios.get(`/profile/getUser/${this.uid}`).then(({ data }) => {
      if (!data.data) return;
      this.user.visit = Number(data.data.visit);
      visitSubscribe(this, this.uid);
      this.$store.commit("interval.setOnRoute", () => {
        axios.get("/profile/subscribe/cancel/visit");
      });
    });
  },
};
</script>
<template>
  <div :class="s.hat">
    <i :class="'fa-solid fa-left-long ' + s.back" @click="$router.back()" />
    <div v-if="text && uid" @click="$router.push(`/user/${uid}`)">
      <i>{{ text[0] }}</i>
      <span>
        <p>{{ text }}</p>
        <s :class="`${s.visit} ${getLastVisit(Number(user.visit)) === 'online' && s.online}`">{{ getLastVisit(user.visit) }}</s>
      </span>
    </div>
    <span v-else :class="s.asTitle">{{ text }}</span>
  </div>
</template>
<style src="./hat.module.scss" lang="scss" />

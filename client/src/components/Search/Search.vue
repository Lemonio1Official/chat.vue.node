<script lang="ts">
import axios from "../../utils/axios";
import { getLastVisit } from "../../utils/getTime";
import s from "./search.module.scss";

interface data {
  itv: number;
  users: {
    id: number;
    nickname: string;
    uid: string;
    visit: number;
  }[];
  value: string;
  focus: boolean;
  s: CSSModuleClasses;
}
export default {
  name: "search",
  data(): data {
    return {
      itv: 0,
      users: [],
      value: "",
      focus: false,
      s,
    };
  },
  methods: {
    oninput() {
      if (!this.value) {
        clearInterval(this.itv);
        return;
      }
      function getUsers(This: data) {
        axios.get("/profile/search/" + This.value).then(({ data }) => {
          This.users = data.data;
        });
      }
      getUsers(this);
      clearInterval(this.itv);
      this.itv = setInterval(() => getUsers(this), 50000);
      this.$store.commit("interval.setOnRoute", () => {
        clearInterval(this.itv);
      });
    },
    getLastVisit,
  },
};
</script>
<template>
  <div :class="s.search">
    <label>
      <input type="text" @focus="focus = true" @blur="focus = false" v-model="value" @input="oninput" />
      <i class="fa-solid fa-search" />
    </label>
    <ul :class="s.found" v-if="focus || value.length">
      <span :class="s.empty" v-if="!users.length">Nothing found ...</span>
      <li v-for="i of users" :key="i.id" @click="$router.push('/user/' + i.uid)">
        <i>{{ i.nickname[0] }}</i>
        <span
          >{{ i.nickname }}
          <s>@{{ i.uid }}</s>
        </span>
        <b :class="`${s.lastVisit} ${getLastVisit(Number(i.visit)) === 'online' && s.online}`">{{ getLastVisit(Number(i.visit)) }}</b>
      </li>
    </ul>
  </div>
</template>
<style src="./search.module.scss" lang="scss" />

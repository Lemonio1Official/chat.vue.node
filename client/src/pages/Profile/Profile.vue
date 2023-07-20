<script lang="ts">
import { $$ } from "../../store/script";
import axios from "../../utils/axios";
import Hat from "../../components/Hat/Hat.vue";
import s from "./profile.module.scss";

interface data {
  nickname: {
    edit: boolean;
    value: string;
  };
  uid: {
    edit: boolean;
    value: string;
  };
  s: CSSModuleClasses;
}
export default {
  name: "profile",
  components: { Hat },
  data(): data {
    return {
      nickname: {
        edit: false,
        value: "",
      },
      uid: {
        edit: false,
        value: "",
      },
      s,
    };
  },
  methods: {
    editHandler(field: "nickname" | "uid") {
      this[field].edit = !this[field].edit;
      if (!this[field].edit) {
        if (this[field].value === this.$$.user.user[field]) return;
        axios.put("/profile/edit", { [field]: this[field].value }).then(({ data }) => {
          if (data.data) {
            this.$store.commit("user.edit", [field, data.data[field]]);
          }
          this.$store.commit("toast.set", data.message);
        });
        return;
      } else {
        setTimeout(() => {
          (this.$refs[field] as HTMLInputElement).focus();
        });
      }
      this[field].value = this.$$.user.user[field];
    },
    logout() {
      this.$store.commit("askWindow.set", [
        "Are you sure?",
        () => {
          this.$router.replace("/auth/login");
          this.$store.commit("toast.set", "You are logged out");
          this.$store.commit("user.logout");
        },
      ]);
    },
  },
  computed: {
    $$,
  },
};
</script>
<template>
  <Hat text="Settings" />
  <div :class="s.profile">
    <div :class="s.settings">
      <div :class="s.user">
        <i :class="s.avatar">{{ $$.user.user.nickname[0] }}</i>
        <form :class="s.nick" @submit.prevent="editHandler('nickname')">
          <em>nickname:</em>
          {{ !nickname.edit ? $$.user.user.nickname : "" }}
          <input ref="nickname" type="text" v-show="nickname.edit" v-model="nickname.value" />
          <i
            :class="`fa-solid fa-${nickname.edit ? 'check' : 'pencil'} ${s.edit} ${nickname.edit && s.d}`"
            @click="editHandler('nickname')"
          />
        </form>
        <form :class="s.uid" @submit.prevent="editHandler('uid')">
          <em>identifier:</em>
          @{{ !uid.edit ? $$.user.user.uid : "" }}
          <input ref="uid" :class="s.uidInp" type="text" v-show="uid.edit" v-model="uid.value" />
          <i :class="`fa-solid fa-${uid.edit ? 'check' : 'pencil'} ${s.edit} ${uid.edit && s.d}`" @click="editHandler('uid')" />
        </form>
      </div>
      <div :class="s.logout" @click="logout">Log out</div>
    </div>
  </div>
</template>
<style src="./profile.module.scss" lang="scss" />

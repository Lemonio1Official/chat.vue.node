<script lang="ts">
import { RouterView } from "vue-router";
import AskWindow from "./components/AskWindow/AskWindow.vue";
import Toast from "./components/Toast/Toast.vue";
import axios from "./utils/axios";
import { $$ } from "./store/script";
import s from "./app.module.scss";

interface data {
  s: CSSModuleClasses;
}
export default {
  name: "app",
  components: { RouterView, AskWindow, Toast },
  data(): data {
    return {
      s,
    };
  },
  mounted() {
    if (window.location.pathname === "/index.html") {
      window.location.pathname = "/";
      return;
    }
    if (this.$$.user.status === false) {
      const token = localStorage.getItem("token");
      if (token) this.$store.commit("user.setStatus", "pending");
      axios.get("/auth/me").then(({ data }) => {
        if (data.data) {
          this.$store.commit("user.setUser", [data.data, this]);
        } else {
          if (this.$route.path !== "/auth/new") this.$router.replace("/auth/login");
        }
      });
    }
  },
  computed: {
    $$,
  },
  watch: {
    $route() {
      this.$store.commit("interval.switchRoute");
    },
  },
};
</script>
<template>
  <div :class="s.app">
    <AskWindow />
    <Toast />
    <RouterView></RouterView>
  </div>
</template>
<style src="./app.module.scss" lang="scss" />

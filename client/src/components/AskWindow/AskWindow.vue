<script lang="ts">
import { $$ } from "../../store/script";
import s from "./askwindow.module.scss";

interface data {
  s: CSSModuleClasses;
}
export default {
  name: "askwindow",
  data(): data {
    return {
      s,
    };
  },
  methods: {
    handler(confirm: boolean) {
      this.$store.commit("askWindow.action", confirm);
    },
  },
  computed: {
    $$,
  },
};
</script>
<template>
  <div :class="s.askwindow" v-if="$$.askWindow.visible">
    <div :class="s.popup">
      <span>{{ $$.askWindow.question }}</span>
      <div>
        <button @click="handler(true)">Confirm</button>
        <button @click="handler(false)">Cancel</button>
      </div>
    </div>
  </div>
</template>
<style src="./askwindow.module.scss" lang="scss" />

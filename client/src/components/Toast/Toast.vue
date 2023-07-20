<script lang="ts">
import { $$ } from "../../store/script";
import s from "./toast.module.scss";

interface data {
  s: CSSModuleClasses;
}
export default {
  name: "toast",
  data(): data {
    return {
      s,
    };
  },
  computed: {
    $$,
  },
};
</script>
<template>
  <div :class="s.toast" v-if="$$.toast.text">
    <span>{{ $$.toast.text }}</span>
    <div :class="s.timeLine"></div>
  </div>
</template>
<style src="./toast.module.scss" lang="scss" />

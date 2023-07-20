<script lang="ts">
import { $$ } from "../../store/script";
import Search from "../../components/Search/Search.vue";
import { messageTime } from "../../utils/getTime";
import s from "./allchats.module.scss";

interface data {
  s: CSSModuleClasses;
}
export default {
  name: "allchats",
  components: { Search },
  data(): data {
    return {
      s,
    };
  },
  methods: {
    messageTime,
  },
  computed: {
    $$,
  },
};
</script>
<template>
  <div :class="s.allchats">
    <div :class="s.header" @click="$router.push('/profile')">
      <div :class="s.profile">
        <i>{{ $$.user.user.nickname[0] }}</i>
        <span>{{ $$.user.user.nickname }}</span>
      </div>
      <i class="fa-solid fa-gear" :class="s.settings"></i>
    </div>
    <Search />
    <div :class="s.chats">
      <div
        :class="s.item"
        v-if="$$.user.user.chats.length"
        v-for="(i, ind) of $$.user.user.chats"
        :key="ind"
        @click="$router.push(`/chat/${i.id}`)"
      >
        <i :class="s.userIco">{{ i.title[0] }}</i>
        <div>
          <span>{{ i.title }}</span>
          <s>{{ i.lastmessage ? i.lastmessage.message : "" }}</s>
        </div>
        <span :class="s.time" v-if="i.lastmessage">
          <i
            v-if="i.lastmessage.mine"
            :class="`fa-solid fa-check${i.lastmessage.status === 'sending' ? '' : '-double'} ${
              i.lastmessage.status === 'checked' && s.checked
            }`"
          ></i>
          {{ i.lastmessage?.time ? messageTime(i.lastmessage.time) : "" }}</span
        >
      </div>
    </div>
  </div>
</template>
<style src="./allchats.module.scss" lang="scss" />

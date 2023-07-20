import { createRouter, createWebHistory } from "vue-router";
import Auth from "./pages/Auth/Auth.vue";
import AllChats from "./pages/AllChats/AllChats.vue";
import Profile from "./pages/Profile/Profile.vue";
import Chat from "./pages/Chat/Chat.vue";
import UProfile from "./pages/UProfile/UProfile.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: AllChats },
    { path: "/auth/:action", component: Auth },
    { path: "/profile", component: Profile },
    { path: "/chat/:id", component: Chat },
    { path: "/user/:uid", component: UProfile },
  ],
});

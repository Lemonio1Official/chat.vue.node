<script lang="ts">
import { RouterLink } from "vue-router";
import { $$ } from "../../store/script";
import axios from "../../utils/axios";
import s from "./auth.module.scss";

type fields = {
  uid: string;
  nickname: string;
  password: string;
};

interface data {
  s: CSSModuleClasses;
  form: {
    fields: fields;
    showPass: boolean;
    errors: { field: keyof fields; value: string }[];
    auth: boolean;
    backErr: string;
  };
}
export default {
  name: "auth",
  components: { RouterLink },
  data(): data {
    return {
      form: {
        fields: {
          uid: "",
          nickname: "",
          password: "",
        },
        showPass: false,
        errors: [],
        auth: this.$route.params.action === "login",
        backErr: "",
      },
      s,
    };
  },
  methods: {
    submit() {
      this.checkForm();
      if (this.form.errors.length) return;
      axios
        .post(`/auth/${this.form.auth ? "login" : "create"}`, {
          uid: this.form.fields.uid,
          nickname: this.form.fields.nickname,
          password: this.form.fields.password,
        })
        .then(({ data }) => {
          if (data.data) {
            this.form.backErr = "";
            this.$store.commit("user.setUser", [data.data, this]);
            this.$store.commit("toast.set", data.message);
            localStorage.setItem("token", data.token);
          } else {
            this.form.backErr = data.message;
          }
        });
    },
    checkForm() {
      this.form.errors = [];
      if (!this.form.auth)
        if (this.form.fields.nickname.length < 4 || this.form.fields.nickname.length > 24)
          this.form.errors.push({ field: "nickname", value: "Invalid length" });
      if (this.form.fields.password.length < 8 || this.form.fields.password.length > 100)
        this.form.errors.push({ field: "password", value: "Invalid length" });
      if (!/^[a-zA-Z0-9_]+$/.test(this.form.fields.uid)) this.form.errors.push({ field: "uid", value: "Wrong symbols" });
      if (this.form.fields.uid.length > 24) this.form.errors.push({ field: "uid", value: "Invalid length" });
    },
    checkErr(field: keyof fields) {
      const err = this.form.errors.find((i) => i.field === field);
      if (err) return err.value;
    },
    switchForm() {
      this.$router.replace(`/auth/${this.form.auth ? "new" : "login"}`);
      this.form.auth = !this.form.auth;
      this.form.errors = [];
    },
    isAuth() {
      if (this.$$.user.status === true) {
        this.$router.replace("/");
      }
    },
  },
  computed: {
    $$,
  },
};
</script>
<template>
  {{ isAuth() }}
  <div :class="s.auth">
    <div :class="s.title">{{ form.auth ? "Sign in" : "Create a new account" }}</div>
    <form @submit.prevent="submit">
      <label
        >Unique identifier
        <span>
          <s>@</s>
          <input type="text" v-model="form.fields.uid" />
        </span>

        <b>{{ checkErr("uid") }}</b>
      </label>
      <label v-if="!form.auth"
        >Nickname
        <input type="text" v-model="form.fields.nickname" />
        <b>{{ checkErr("nickname") }}</b>
      </label>
      <label
        >Password
        <i :class="`fa-solid fa-eye${form.showPass ? '' : '-slash'} ${s.showPass}`" @click="form.showPass = !form.showPass" />
        <input :type="form.showPass ? 'text' : 'password'" v-model="form.fields.password" />
        <b>{{ checkErr("password") }}</b>
      </label>
      <button>
        <span :class="s.backErr" v-if="form.backErr">{{ form.backErr }}</span>
        {{ form.auth ? "LOGIN" : "SUBMIT" }}
      </button>
      <div :class="s.actions">
        <RouterLink to="/auth/new" @click="switchForm">{{
          form.auth ? "Don't have an account yet?" : "Already have an account?"
        }}</RouterLink>
      </div>
    </form>
  </div>
</template>
<style src="./auth.module.scss" lang="scss" />

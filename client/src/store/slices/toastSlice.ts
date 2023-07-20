import { createSlice } from "../script";

export interface IToast {
  text: string;
}

const state: IToast = {
  text: "",
};

const toastSlice = createSlice({
  name: "toast",
  state,
  reducers: {
    set(s, p) {
      if (s.text) return;
      s.text = p;
      setTimeout(() => {
        s.text = "";
      }, 4000);
    },
  },
});

export default toastSlice;

import { createSlice } from "../script";

export interface IAskWindow {
  visible: boolean;
  question: string;
  cb: (...args: any[]) => void;
}

const state: IAskWindow = {
  visible: false,
  question: "",
  cb: () => {},
};

const askWSlice = createSlice({
  name: "askWindow",
  state,
  reducers: {
    set(s, p) {
      s.visible = true;
      s.question = p[0];
      s.cb = p[1];
    },
    action(s, p) {
      if (p) s.cb();
      s.visible = false;
      s.question = "";
      s.cb = () => {};
    },
  },
});

export default askWSlice;

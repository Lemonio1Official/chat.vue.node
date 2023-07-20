import { createSlice } from "../script";

export interface IInterval {
  route: boolean;
  onRoute: ((...args: any[]) => void)[];
}

const state: IInterval = {
  route: false,
  onRoute: [],
};

const intervalSlice = createSlice({
  name: "interval",
  state,
  reducers: {
    setOnRoute(s, p) {
      s.onRoute.push(p);
    },
    switchRoute(s) {
      s.route = !s.route;
      for (const f of s.onRoute) {
        f();
      }
      s.onRoute = [];
    },
  },
});

export default intervalSlice;

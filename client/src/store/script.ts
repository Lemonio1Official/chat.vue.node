import { IInterval } from "./slices/intrevalSlice";
import { IToast } from "./slices/toastSlice";
import { IAskWindow } from "./slices/askWSlice";
import { IUser } from "./slices/userSlice";
import { createStore } from "vuex";

const AF = (async () => {}).constructor;

interface ISliceProps<T> {
  name: string;
  state: T;
  reducers: { [key: string]: (s: T, p?: any) => void };
  getters?: {};
}

export function createSlice<T>(props: ISliceProps<T>) {
  for (const k of Object.keys(props.reducers)) {
    const f = props.reducers[k];
    props.reducers[k] = f instanceof AF ? async (s: any, p) => f(s[props.name], p) : (s: any, p) => f(s[props.name], p);
  }

  return props;
}

export function CreateStore(slices: ISliceProps<any>[]) {
  const state: { [key: string]: any } = {};
  const mutations: { [key: string]: (s: any, p?: any) => void } = {};
  const actions: { [key: string]: (main: { commit: (name: string, v?: any) => void }, v?: any) => void } = {};
  const getters = {};

  for (const i of slices) {
    state[i.name] = i.state;
    for (const k of Object.keys(i.reducers)) {
      const FNAME = i.name + "." + k;
      if (i.reducers[k] instanceof AF) {
        mutations[FNAME] = i.reducers[k];
        actions[FNAME] = ({ commit }, v) => {
          commit(FNAME, v);
        };
      } else {
        mutations[i.name + "." + k] = i.reducers[k];
      }
    }
  }

  const store = { state, mutations, actions, getters };

  return createStore(store);
}

export function setState(state: any, newState: any) {
  for (const k of Object.keys(state)) {
    state[k] = newState[k];
  }
}

export function $$(this: any) {
  return this.$store.state as {
    user: IUser;
    askWindow: IAskWindow;
    toast: IToast;
    interval: IInterval;
  };
}

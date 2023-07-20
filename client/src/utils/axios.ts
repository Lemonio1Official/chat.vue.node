import { host } from "./../host";
import axios from "axios";

const instance = axios.create({
  baseURL: host + "/api",
});

instance.interceptors.request.use((config) => {
  config.headers.token = localStorage.getItem("token");
  return config;
});

export default instance;

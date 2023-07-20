import { CreateStore } from "./script";
import askWSlice from "./slices/askWSlice";
import intervalSlice from "./slices/intrevalSlice";
import toastSlice from "./slices/toastSlice";
import userSlice from "./slices/userSlice";

const store = CreateStore([userSlice, askWSlice, toastSlice, intervalSlice]);

export default store;

import { Router } from "../../lib/server";
import { checkAuth } from "../utils/checkAuth";
import { create, login, getMe } from "../controllers/auth";

const router = Router();

//Register
router.post("/create", create);

//Login
router.post("/login", login);

//Get me
router.get("/me", checkAuth, getMe);

export default router;

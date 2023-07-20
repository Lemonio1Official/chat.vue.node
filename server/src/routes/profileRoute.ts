import { Router } from "../../lib/server";
import { checkAuth } from "../utils/checkAuth";
import { edit, getUserProfile, lastVisit, search, subUserVisitCancel, subscribeVisit } from "../controllers/profile";

const router = Router();

//Edit
router.put("/edit", checkAuth, edit);

//Search
router.get("/search/:uid", search);

//Last Visit
router.get("/offline", checkAuth, lastVisit);

//Get user Profile
router.get("/getUser/:uid", checkAuth, getUserProfile);

//Subscribe User visit
router.get("/subscribe/visit/:uid", checkAuth, subscribeVisit);

//Cancel visit subscribe
router.get("/subscribe/cancel/visit", checkAuth, subUserVisitCancel);

export default router;

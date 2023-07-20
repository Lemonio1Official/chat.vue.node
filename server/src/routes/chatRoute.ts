import { Router } from "../../lib/server";
import { checkAuth } from "../utils/checkAuth";
import { create, getMessages, getUser, sendMessage } from "../controllers/chat/chat";
import { subscribeMessage, cancelSubMessage, subChats, cancelSubChats } from "../controllers/chat/subscribes";
import { checkMessage, deleteMessage, editMessage } from "../controllers/chat/actions";

const router = Router();

// Create chat
router.post("/create/:uid", checkAuth, create);
// Get user
router.get("/getUser/:id", checkAuth, getUser);
// Send message
router.post("/send/message", checkAuth, sendMessage);
// Get messages
router.get("/get/messages/:id", checkAuth, getMessages);
// Message subscribe
router.get("/subscribe/message/:id", checkAuth, subscribeMessage);
router.get("/subscribe/cancel/message", checkAuth, cancelSubMessage);
// Chats subscribe
router.get("/subscribe/chats", checkAuth, subChats);
router.get("/subscribe/cancel/chats", checkAuth, cancelSubChats);
// Check message
router.post("/message/check/:id", checkAuth, checkMessage);
// Edit message
router.post("/message/edit/:id", checkAuth, editMessage);
// Delete message
router.post("/message/delete/:id", checkAuth, deleteMessage);

export default router;

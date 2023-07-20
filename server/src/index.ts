import server from "../lib/server";
import authRoute from "./routes/authRoute";
import profileRoute from "./routes/profileRoute";
import chatRoute from "./routes/chatRoute";

const PORT = 4444;
const app = server();

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/chat", chatRoute);

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});

const db: any = {};

export default () => {
  db.createTable("users", {
    uid: {
      type: "string",
      maxLength: 24,
      unique: true,
    },
    nickname: {
      type: "string",
      maxLength: 24,
    },
    password: {
      type: "string",
      maxLength: 100,
    },
    visit: {
      type: "number",
      default: 0,
    },
    chats: {
      type: "object",
      default: [],
    },
  });
};

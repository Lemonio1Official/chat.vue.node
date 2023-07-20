const db: any = {};
export default () => {
  db.createTable("chats", {
    members: {
      type: "object",
    },
    messages: {
      type: "object",
      default: [],
    },
  });
};

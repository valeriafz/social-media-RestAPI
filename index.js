const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const UserRoute = require("./routes/users");
const AuthRoute = require("./routes/auth");
const PostRoute = require("./routes/posts");

dotenv.config(); // ready to use

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connection successful"));

// for request parsing
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// app.get("/users", (request, response) => {
//   response.send("This is the user page");
// });

app.use("/api/users", UserRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/posts", PostRoute);

app.listen(8800, () => {
  console.log("server is running");
});

const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/register", async (request, response) => {
  // const user = await new User({
  //   username: "Valeria",
  //   email: "valeria@gmail.com",
  //   password: "asdfg",
  // });
  // await user.save();
  // response.send("This one uses .get");

  try {
    const generator = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, generator);

    const newUser = new User({
      username: request.body.username,
      email: request.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    response.status(200).json(user);
  } catch (err) {
    response.status(500).json(err);
  }
});

router.post("/login", async (request, response) => {
  try {
    const user = await User.findOne({ email: request.body.email });
    !user && response.status(404).json("no such user");

    const validPassword = await bcrypt.compare(
      request.body.password,
      user.password
    );

    !validPassword && response.status(400).json("incorrect password");
    response.status(200).json(user);
  } catch (err) {
    response.status(500).json(err);
  }
});

module.exports = router;

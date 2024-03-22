const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// router.get("/", (request, response) => {
//   response.send("This is the user page");
// });

// update user
router.put("/:id", async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    if (request.body.password) {
      try {
        const generator = await bcrypt.genSalt(10);
        request.body.password = await bcrypt.hash(
          request.body.password,
          generator
        );
      } catch (err) {
        return response.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(request.params.id, {
        $set: request.body,
      });
      response.status(200).json("Account has been updated");
    } catch (err) {
      return response.status(500).json(err);
    }
  } else {
    return response.status(403).json("You can update only your account!");
  }
});

// delete user
router.delete("/:id", async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(request.params.id, {
        $set: request.body,
      });
      response.status(200).json("Account has been deleted");
    } catch (err) {
      return response.status(500).json(err);
    }
  } else {
    return response.status(403).json("You can delete only your account!");
  }
});

// get user
router.get("/:id", async (request, response) => {
  try {
    const user = await User.findById(request.params.id);
    const { password, updatedAt, ...other } = user._doc; // exclude unnecessary info postman
    response.status(200).json(other);
  } catch (err) {
    return response.status(500).json(err);
  }
});

//follow user
router.put("/:id/follow", async (request, response) => {
  if (request.body.userId !== request.params.id) {
    try {
      const user = await User.findById(request.params.id);
      const currentUser = await User.findById(request.body.userId);
      if (!user.followers.includes(request.body.userId)) {
        await user.updateOne({ $push: { followers: request.body.userId } });
        await currentUser.updateOne({
          $push: { followings: request.params.id },
        });
        response.status(200).json("You now follow this user!");
      } else {
        response.status(403).json("You already follow this user!");
      }
    } catch (err) {
      response.status(500).json(err);
    }
  } else {
    response.status(403).json("You can't follow yourself");
  }
});

//unfollow user
router.put("/:id/unfollow", async (request, response) => {
  if (request.body.userId !== request.params.id) {
    try {
      const user = await User.findById(request.params.id);
      const currentUser = await User.findById(request.body.userId);
      if (user.followers.includes(request.body.userId)) {
        await user.updateOne({ $pull: { followers: request.body.userId } });
        await currentUser.updateOne({
          $pull: { followings: request.params.id },
        });
        response.status(200).json("You have unfollowed this user.");
      } else {
        response.status(403).json("You don't follow this user!");
      }
    } catch (err) {
      response.status(500).json(err);
    }
  } else {
    response.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;

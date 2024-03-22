const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create post
router.post("/", async (request, response) => {
  const newPost = new Post(request.body);
  try {
    const savedPost = await newPost.save();
    response.status(200).json(savedPost);
  } catch (err) {
    response.status(500).json(err);
  }
});

// delete post
router.delete("/:id", async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (post.userId === request.body.userId) {
      await post.deleteOne();
      response.status(200).json("The post has been deleted");
    } else {
      response.status(403).json("You can delete only your post");
    }
  } catch (err) {
    response.status(500).json(err);
  }
});

// update post
router.put("/:id", async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (post.userId === request.body.userId) {
      await post.updateOne({ $set: request.body });
      response.status(200).json("The post has been updated");
    } else {
      response.status(403).json("You can update only your post");
    }
  } catch (err) {
    response.status(500).json(err);
  }
});

// like/dislike post
router.put("/:id/like", async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (!post.likes.includes(request.body.userId)) {
      await post.updateOne({ $push: { likes: request.body.userId } });
      response.status(200).json("Post has been liked!");
    } else {
      await post.updateOne({ $pull: { likes: request.body.userId } });
      response.status(200).json("Post has been disliked!");
    }
  } catch (err) {
    response.status(500).json(err);
  }
});

// get post
router.get("/:id", async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    response.status(200).json(post);
  } catch (err) {
    return response.status(500).json(err);
  }
});

// get all posts of followings (feed/timeline)
router.get("/timeline", async (request, response) => {
  const posts = [];
  try {
    const currentUser = await User.findById(request.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        Post.find({ userId: followingId });
      })
    );
    response.json(userPosts.concat(...friendPosts));
  } catch (err) {
    response.status(500).json(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');
const { storage, cloudinary } = require('./cloudinary');

const upload = multer({ storage });

// 📝 Create a Post
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { userId, caption } = req.body;

    const newPost = new Post({
      userId,
      caption,
      imageUrl: req.file ? req.file.path : '',
      publicId: req.file?.filename // Save the public ID from Cloudinary
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: 'Post created successfully!', post: savedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ❤️ Like / Unlike Post
router.put('/like/:postId', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter(id => id !== userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error liking post' });
  }
});

// 💬 Comment on Post
router.post('/comment/:postId', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId, text });
    await post.save();

    res.status(200).json({ message: 'Comment added!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to comment' });
  }
});

// 📰 Get All Posts (Feed)
router.get('/all', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic');

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// 🗑️ Delete Post by ID
router.delete('/delete/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Delete image from Cloudinary if it exists
    if (post.publicId) {
      await cloudinary.uploader.destroy(post.publicId);
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;

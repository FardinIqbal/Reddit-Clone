/**
 * Phreddit Server
 * @module server
 *
 * @description Main server file for the Phreddit application.
 * Handles API routes and database connections.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Import models
const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');

// Middleware setup
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads

require('dotenv').config();  // Enable environment variables

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phreddit';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

/**
 * Helper function to recursively populate comments
 */
async function populateComments(comment) {
    await comment.populate('commentIDs');

    for (let childComment of comment.commentIDs) {
        await populateComments(childComment);
    }
}

/**
 * Post Routes
 */

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        console.log('Fetching all posts and communities...');
        const [posts, communities] = await Promise.all([Post.find().populate('linkFlairID'), Community.find()]);

        const transformedPosts = posts.map(post => {
            const communityForPost = communities.find(community => community.postIDs.some(postId => postId.equals(post._id)));
            return {
                ...post.toObject(),
                linkFlair: post.linkFlairID,
                community: communityForPost ? {
                    _id: communityForPost._id,
                    name: communityForPost.name
                } : {name: 'Unknown Community'},
            };
        });

        res.json(transformedPosts);
    } catch (err) {
        console.error('Error during post fetching or transformation:', err);
        res.status(500).json({message: err.message});
    }
});

// Get a single post by ID
app.get('/api/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('linkFlairID')
            .populate('commentIDs');

        if (!post) {
            return res.status(404).json({message: 'Post not found'});
        }

        // Recursively populate comments
        for (let comment of post.commentIDs) {
            await populateComments(comment);
        }

        const community = await Community.findOne({postIDs: post._id});

        const postWithDetails = {
            ...post.toObject(),
            linkFlair: post.linkFlairID,
            comments: post.commentIDs,
            community: community ? {_id: community._id, name: community.name} : {name: 'Unknown Community'},
        };

        res.json(postWithDetails);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({message: err.message});
    }
});

// Increment view count for a post
app.patch('/api/posts/:postId/views', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.postId, {$inc: {views: 1}}, {new: true});

        if (!post) {
            return res.status(404).json({message: 'Post not found'});
        }

        res.json(post);
    } catch (err) {
        console.error('Error incrementing post views:', err);
        res.status(500).json({message: err.message});
    }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
    const {title, content, postedBy, communityID, linkFlairID} = req.body;

    if (!title || !content || !postedBy || !communityID) {
        return res.status(400).json({message: 'Missing required fields'});
    }

    if (title.length > 100) {
        return res.status(400).json({message: 'Title cannot exceed 100 characters'});
    }

    try {
        const newPost = new Post({
            title: title.trim(),
            content: content.trim(),
            postedBy: postedBy.trim(),
            postedDate: new Date(),
            views: 0,
            linkFlairID: linkFlairID || null,
            commentIDs: [],
        });

        const savedPost = await newPost.save();
        const community = await Community.findById(communityID);
        if (!community) {
            return res.status(404).json({message: 'Community not found'});
        }

        community.postIDs.push(savedPost._id);
        await community.save();

        res.status(201).json(savedPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({message: err.message});
    }
});

/**
 * Comment Routes
 */

// Create a new comment
app.post('/api/comments', async (req, res) => {
    const {content, commentedBy, postId, parentCommentId} = req.body;

    if (!content || !commentedBy) {
        return res.status(400).json({message: 'Content and username are required'});
    }

    if (content.length > 500) {
        return res.status(400).json({message: 'Content cannot exceed 500 characters'});
    }

    try {
        const newComment = new Comment({
            content: content.trim(), commentedBy: commentedBy.trim(), commentedDate: new Date(), commentIDs: [],
        });

        const savedComment = await newComment.save();

        if (parentCommentId) {
            // Handle reply to a comment
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({message: 'Parent comment not found'});
            }

            parentComment.commentIDs.push(savedComment._id);
            await parentComment.save();
        } else if (postId) {
            // Handle top-level comment on a post
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({message: 'Post not found'});
            }

            post.commentIDs.push(savedComment._id);
            await post.save();
        } else {
            return res.status(400).json({message: 'Either postId or parentCommentId must be provided'});
        }

        res.status(201).json(savedComment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({message: err.message});
    }
});

/**
 * Route to get total comment count for a post
 */
app.get('/api/posts/:postId/comments/count', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('commentIDs');
        if (!post) {
            return res.status(404).json({message: 'Post not found'});
        }

        let totalComments = 0;

        // Recursive function to count all comments
        async function countComments(comments) {
            for (let comment of comments) {
                if (comment) {
                    totalComments += 1;
                    await comment.populate('commentIDs');
                    if (comment.commentIDs.length > 0) {
                        await countComments(comment.commentIDs);
                    }
                }
            }
        }

        await countComments(post.commentIDs);

        res.json({count: totalComments});
    } catch (err) {
        console.error('Error counting comments:', err);
        res.status(500).json({message: err.message});
    }
});

/**
 * Link Flair Routes
 */

// Get all link flairs
app.get('/api/linkflairs', async (req, res) => {
    try {
        const linkFlairs = await LinkFlair.find();
        res.json(linkFlairs);
    } catch (err) {
        console.error('Error fetching link flairs:', err);
        res.status(500).json({message: err.message});
    }
});

// Create a new link flair
app.post('/api/linkflairs', async (req, res) => {
    const {content} = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({message: 'Link flair content is required'});
    }

    if (content.length > 30) {
        return res.status(400).json({message: 'Link flair cannot exceed 30 characters'});
    }

    try {
        const newLinkFlair = new LinkFlair({content: content.trim()});
        const savedLinkFlair = await newLinkFlair.save();
        res.status(201).json(savedLinkFlair);
    } catch (err) {
        console.error('Error creating link flair:', err);
        res.status(500).json({message: err.message});
    }
});

/**
 * Community Routes
 */

// Get all communities
app.get('/api/communities', async (req, res) => {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (err) {
        console.error('Error fetching communities:', err);
        res.status(500).json({message: err.message});
    }
});

// Get a single community by ID
app.get('/api/communities/:communityId', async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);
        if (!community) {
            return res.status(404).json({message: 'Community not found'});
        }
        res.json(community);
    } catch (err) {
        console.error('Error fetching community by ID:', err);
        res.status(500).json({message: err.message});
    }
});

// Get posts for a specific community
app.get('/api/communities/:communityId/posts', async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);
        if (!community) {
            return res.status(404).json({message: 'Community not found'});
        }

        // Fetch posts associated with the community
        const posts = await Post.find({_id: {$in: community.postIDs}})
            .populate('linkFlairID')
            .populate('commentIDs');

        // Transform posts to include community and link flair information
        const transformedPosts = posts.map(post => ({
            ...post.toObject(), linkFlair: post.linkFlairID, community: {_id: community._id, name: community.name},
        }));

        res.json(transformedPosts);
    } catch (err) {
        console.error('Error fetching posts for community:', err);
        res.status(500).json({message: err.message});
    }
});

// Create a new community
app.post('/api/communities', async (req, res) => {
    const {name, description, creatorUsername} = req.body;

    if (!name || !description || !creatorUsername) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const community = new Community({
        name: name.trim(),
        description: description.trim(),
        members: [creatorUsername.trim()],
        startDate: new Date(),
        memberCount: 1,
        postIDs: [],
    });

    try {
        const newCommunity = await community.save();
        res.status(201).json(newCommunity);
    } catch (err) {
        console.error('Error creating community:', err);
        res.status(500).json({message: 'Failed to create community'});
    }
});

/**
 * Server startup and graceful shutdown
 */
const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

const gracefulShutdown = () => {
    server.close(() => {
        mongoose.connection.close(false)
            .then(() => {
                console.log('Server closed. Database instance disconnected');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error during database disconnection:', err);
                process.exit(1);
            });
    });
};

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

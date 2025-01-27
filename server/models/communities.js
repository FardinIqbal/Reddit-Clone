/**
 * Community Schema for MongoDB
 * @module models/communities
 * @requires mongoose
 * 
 * @description Defines the schema for communities in the Phreddit application.
 * Schema is designed to match the data structure used in initializeDB.js while
 * maintaining proper validation and relationships.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Community Schema Definition
 * 
 * Required fields from initializeDB:
 * - name (string): Community name (max 100 chars)
 * - description (string): Community description (max 500 chars)
 * - members (string[]): Array of usernames
 * - startDate (Date): Community creation date
 * - postIDs (ObjectId[]): References to Post documents
 * 
 * Note: While communityID is provided in test data, we'll use MongoDB's _id
 * as the unique identifier instead of maintaining a separate ID field.
 */
const communitySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Community name is required'],
        maxLength: [100, 'Community name cannot exceed 100 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Community description is required'],
        maxLength: [500, 'Community description cannot exceed 500 characters'],
        trim: true
    },
    // References to Post documents - matches initializeDB structure
    postIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    // Array of usernames - matches initializeDB structure
    members: {
        type: [String],
        required: [true, 'At least one member is required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length >= 1;
            },
            message: 'Community must have at least one member'
        }
    },
    // Member count is maintained separately as per initializeDB
    memberCount: {
        type: Number,
        required: false,
        default: 0,
        min: [0, 'Member count cannot be negative']
    }
});

/**
 * Virtual for community's URL
 * Required by specification to return communities/_id
 */
communitySchema.virtual('url').get(function() {
    return `communities/${this._id}`;
});

/**
 * Pre-save middleware to ensure memberCount matches members array
 * This helps maintain data consistency
 */
communitySchema.pre('save', function(next) {
    if (this.members) {
        this.memberCount = this.members.length;
    }
    next();
});

/**
 * Custom method to add a post to the community
 * @param {ObjectId} postId - The ID of the post to add
 */
communitySchema.methods.addPost = function(postId) {
    if (!this.postIDs.includes(postId)) {
        this.postIDs.push(postId);
    }
};

/**
 * Custom method to add a member to the community
 * @param {string} username - The username to add
 */
communitySchema.methods.addMember = function(username) {
    if (!this.members.includes(username)) {
        this.members.push(username);
        this.memberCount = this.members.length;
    }
};

// Create the model from the schema
const Community = mongoose.model('Community', communitySchema);

// Export the model
module.exports = Community;

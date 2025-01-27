/**
 * Post Schema for MongoDB
 * @module models/posts
 * @requires mongoose
 *
 * @description Matches initializeDB.js structure for posts while
 * maintaining proper relationships and validation.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Post Schema Definition
 * Based on initializeDB structure:
 * - title: string (required, max 100 chars)
 * - content: string (required)
 * - linkFlairID: reference to LinkFlair (singular)
 * - postedBy: string (required)
 * - postedDate: Date (required)
 * - commentIDs: array of comment references
 * - views: number (required)
 */
const postSchema = new Schema({
    title: {
        type: String, required: true, maxLength: [100, 'Title cannot be longer than 100 characters'], trim: true
    }, content: {
        type: String, required: true, trim: true
    }, linkFlairID: {  // Adjusted to singular to match initializeDB.js
        type: Schema.Types.ObjectId, ref: 'LinkFlair'
    }, postedBy: {
        type: String, required: true, trim: true
    }, postedDate: {
        type: Date, required: true, default: Date.now
    }, commentIDs: [{
        type: Schema.Types.ObjectId, ref: 'Comment'
    }], views: {
        type: Number, required: true, default: 0, min: [0, 'View count cannot be negative']
    }
});

// Virtual field 'url' for the post
postSchema.virtual('url').get(function () {
    return `/posts/${this._id}`;
});

// Enable virtuals to be included in toJSON and toObject outputs
postSchema.set('toJSON', {virtuals: true});
postSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('Post', postSchema);

/**
 * Comment Schema for MongoDB
 * @module models/comments
 * @requires mongoose
 *
 * @description Matches initializeDB.js structure for comments while
 * maintaining data validation and proper relationships.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Comment Schema Definition
 * Based on initializeDB structure:
 * - commentID is handled by MongoDB's _id
 * - content: string (required)
 * - commentIDs: array of references for nested replies
 * - commentedBy: string (required)
 * - commentedDate: Date (required)
 */
const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxLength: [500, 'Comment cannot be longer than 500 characters'],
        trim: true
    }, commentIDs: [{
        type: Schema.Types.ObjectId, ref: 'Comment'
    }], commentedBy: {
        type: String, required: [true, 'Comment author is required'], trim: true
    }, commentedDate: {
        type: Date, required: [true, 'Comment date is required'], default: Date.now
    }
});

// Virtual field to generate the URL path for a comment
commentSchema.virtual('url').get(function () {
    return `/comments/${this._id}`;
});

// Enable virtuals to be included when converting documents to JSON
commentSchema.set('toJSON', {virtuals: true});
commentSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('Comment', commentSchema);

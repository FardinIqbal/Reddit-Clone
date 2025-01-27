/**
 * LinkFlair Schema for MongoDB
 * @module models/linkflairs
 * @requires mongoose
 * 
 * @description Matches initializeDB.js structure for link flairs.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * LinkFlair Schema Definition
 * Based on initializeDB structure:
 * - linkFlairID is handled by MongoDB's _id
 * - content: string (required)
 */
const linkFlairSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: [30, 'Link flair cannot be longer than 30 characters'],
        trim: true
    }
});

linkFlairSchema.virtual('url').get(function() {
    return `linkFlairs/${this._id}`;
});

module.exports = mongoose.model('LinkFlair', linkFlairSchema);

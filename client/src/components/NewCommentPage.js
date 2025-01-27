/**
 * NewCommentPage Component
 * @module components/NewCommentPage
 *
 * @description Provides a form for users to submit a new comment.
 * Users can enter their username and comment content.
 * The form includes validation and error handling.
 */

import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/NewCommentPage.css';

const NewCommentPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const location = useLocation();
    const { parentCommentId } = location.state || {};

    // Form state
    const [content, setContent] = useState('');
    const [commentedBy, setCommentedBy] = useState('');

    // Error state
    const [errors, setErrors] = useState({});

    // Success and error messages
    const [successMessage, setSuccessMessage] = useState('');
    const [submissionError, setSubmissionError] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!content.trim()) {
            newErrors.content = 'Comment content is required.';
        } else if (content.length > 500) {
            newErrors.content = 'Comment cannot exceed 500 characters.';
        }

        if (!commentedBy.trim()) {
            newErrors.commentedBy = 'Username is required.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const commentData = {
                content: content.trim(),
                commentedBy: commentedBy.trim(),
                postId: postId,
                parentCommentId: parentCommentId || null,
            };

            console.log('Submitting comment data:', commentData);

            // Create new comment
            const commentResponse = await axios.post('http://localhost:8000/api/comments', commentData);

            if (commentResponse.status === 201) {
                // Set success message
                setSuccessMessage('Comment submitted successfully! Redirecting to post...');
                // Clear any previous errors
                setSubmissionError('');
                // Redirect back to the post page after a short delay
                setTimeout(() => {
                    navigate(`/post/${postId}`);
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting comment:', error.response?.data || error.message);
            setSubmissionError('An error occurred while submitting the comment. Please try again.');
            // Clear any success message
            setSuccessMessage('');
        }
    };

    return (
        <div className="new-comment-container">
            <h1 className="new-comment-title">Submit a New Comment</h1>
            <form className="new-comment-form" onSubmit={handleSubmit}>
                {/* Comment Content */}
                <div className="new-comment-form-group">
                    <label htmlFor="comment-content" className="new-comment-label">
                        Comment Content <span className="new-comment-required">*</span>
                    </label>
                    <textarea
                        id="comment-content"
                        className="new-comment-textarea"
                        value={content}
                        maxLength={500}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    {errors.content && <p className="new-comment-error">{errors.content}</p>}
                </div>

                {/* Username */}
                <div className="new-comment-form-group">
                    <label htmlFor="username" className="new-comment-label">
                        Username <span className="new-comment-required">*</span>
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="new-comment-input"
                        value={commentedBy}
                        onChange={(e) => setCommentedBy(e.target.value)}
                    />
                    {errors.commentedBy && <p className="new-comment-error">{errors.commentedBy}</p>}
                </div>

                {/* Submission Error */}
                {submissionError && <p className="new-comment-error">{submissionError}</p>}

                {/* Success Message */}
                {successMessage && <p className="new-comment-success">{successMessage}</p>}

                {/* Submit Button */}
                <button type="submit" className="new-comment-submit">
                    Submit Comment
                </button>
            </form>
        </div>
    );
};

export default NewCommentPage;

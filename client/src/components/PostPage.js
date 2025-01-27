/**
 * PostPage Component
 * @module components/PostPage
 *
 * @description Displays a single post with comments in a threaded format.
 * Handles view count increments and comment navigation.
 */

import React, {useEffect, useMemo, useRef, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import {formatTimestamp} from '../utils/timeUtils';
import '../stylesheets/PostPage.css';

/**
 * Recursive function to count all comments and their replies
 * @param {Array} comments - Array of comments
 * @returns {number} - Total number of comments
 */
const countAllComments = (comments) => {
    if (!comments || comments.length === 0) return 0;
    let count = 0;
    for (const comment of comments) {
        if (comment) {
            count += 1; // Count the comment itself
            count += countAllComments(comment.commentIDs);
        }
    }
    return count;
};

/**
 * Recursive comment component for handling nested replies
 * @param {Object} props - Props for the CommentThread component
 * @returns {JSX.Element} - The CommentThread component
 */
const CommentThread = ({comment, depth = 0, postId}) => {
    const navigate = useNavigate();
    if (!comment) return null;

    const maxDepth = 8;
    const adjustedDepth = Math.min(depth, maxDepth);

    return (<div
            className="post-page-comment-thread"
            data-depth={adjustedDepth}
            style={{'--depth': adjustedDepth}}
        >
            <div className="post-page-comment">
                <div className="post-page-comment-metadata">
                    <span className="post-page-comment-author">
                        {comment?.commentedBy || 'Anonymous'}
                    </span>
                    <span className="separator">•</span>
                    <span className="timestamp">
                        {formatTimestamp(new Date(comment?.commentedDate || Date.now()))}
                    </span>
                </div>
                <p className="post-page-comment-content">{comment?.content || ''}</p>
                <button
                    className="post-page-reply-button"
                    aria-label="Reply to comment"
                    onClick={() => navigate(`/post/${postId}/comment`, {
                        state: {parentCommentId: comment._id},
                    })}
                >
                    Reply
                </button>
            </div>
            {comment?.commentIDs?.length > 0 && (<div className="post-page-replies">
                    {comment.commentIDs
                        .filter((reply) => reply)
                        .sort((a, b) => new Date(b?.commentedDate || 0) - new Date(a?.commentedDate || 0))
                        .map((reply) => (<CommentThread
                                key={reply?._id || Math.random()}
                                comment={reply}
                                depth={depth + 1}
                                postId={postId}
                            />))}
                </div>)}
        </div>);
};

/**
 * Main component for displaying a single post page
 * @returns {JSX.Element} - The PostPage component
 */
const PostPage = () => {
    const {postId} = useParams();
    const navigate = useNavigate();
    const hasIncrementedView = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                if (!hasIncrementedView.current) {
                    await axios.patch(`http://localhost:8000/api/posts/${postId}/views`);
                    hasIncrementedView.current = true;
                }

                const response = await axios.get(`http://localhost:8000/api/posts/${postId}`);
                if (response.status === 200) {
                    setPost(response.data);
                    setErrorMessage('');
                } else {
                    setErrorMessage('Failed to load post. Please try again.');
                }
            } catch (error) {
                setErrorMessage('Failed to load post. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        } else {
            setErrorMessage('Invalid post ID.');
            setIsLoading(false);
        }
    }, [postId]);

    const totalCommentCount = useMemo(() => countAllComments(post?.comments), [post?.comments]);

    if (isLoading) {
        return <div className="post-page-loading">Loading post...</div>;
    }

    if (errorMessage) {
        return <div className="post-page-error-state">{errorMessage}</div>;
    }

    if (!post) {
        return <div className="post-page-error-state">Post not found</div>;
    }

    const communityInfo = post.community;

    return (<div className="post-page">
            <header className="post-page-header">
                <div className="post-page-metadata">
                    {communityInfo?._id ? (<span
                            className="post-page-community-link"
                            onClick={() => navigate(`/community/${communityInfo._id}`)}
                        >
                            {communityInfo.name}
                        </span>) : (<span className="post-page-community-name">
                            {communityInfo?.name || 'Unknown Community'}
                        </span>)}
                    <span className="separator">•</span>
                    <span className="timestamp">
                        {formatTimestamp(new Date(post.postedDate))}
                    </span>
                </div>
                <div className="post-page-author">Posted by {post.postedBy}</div>
                <h1 className="post-page-title">{post.title}</h1>
                {post.linkFlair && <span className="post-page-link-flair">{post.linkFlair.content}</span>}
                <div className="post-page-content">{post.content}</div>
                <div className="post-page-stats">
                    <span className="views">{post.views} views</span>
                    <span className="separator">•</span>
                    <span className="comments">{totalCommentCount} comments</span>
                </div>
                <button
                    className="post-page-add-comment-button"
                    onClick={() => navigate(`/post/${post._id}/comment`)}
                >
                    Add a comment
                </button>
            </header>
            <div className="post-page-comments-section">
                <div className="post-page-section-delimiter"/>
                {post.comments?.length > 0 ? (<div className="post-page-comments-list">
                        {post.comments
                            .filter((comment) => comment && !comment.parentId)
                            .sort((a, b) => new Date(b?.commentedDate || 0) - new Date(a?.commentedDate || 0))
                            .map((comment) => (<CommentThread
                                    key={comment?._id || Math.random()}
                                    comment={comment}
                                    postId={postId}
                                />))}
                    </div>) : (<div className="post-page-no-comments">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>)}
            </div>
        </div>);
};

export default PostPage;

/**
 * HomePage Component
 * @module components/HomePage
 *
 * @description Displays all posts with sorting options and post count.
 * Posts are displayed in a list format with community info, title,
 * content preview, and metadata.
 */

import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import { formatTimestamp } from '../utils/timeUtils';
import '../stylesheets/HomePage.css';

// Define sorting types
const SORT_TYPES = {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    ACTIVE: 'active'
};

const HomePage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]); // State to hold fetched posts
    const [sortType, setSortType] = useState(SORT_TYPES.NEWEST);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch posts from the server when the component mounts
    useEffect(() => {
        // Set loading state to true
        setIsLoading(true);

        // Make a GET request to fetch posts
        axios.get('http://localhost:8000/api/posts')
            .then(response => {
                // Set the fetched posts to state
                setPosts(response.data);
                // Set loading state to false
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                // Even if there's an error, stop the loading state
                setIsLoading(false);
            });
    }, []); // Empty dependency array ensures this runs once on mount

    // Memoize sorted posts to optimize performance
    const sortedPosts = useMemo(() => {
        if (!posts || posts.length === 0) return [];
        const postsCopy = [...posts].filter(post => post && post.postedDate);

        switch (sortType) {
            case SORT_TYPES.OLDEST:
                return postsCopy.sort((a, b) =>
                    new Date(a.postedDate) - new Date(b.postedDate)
                );
            case SORT_TYPES.ACTIVE:
                return postsCopy.sort((a, b) => {
                    const aLastComment = a.comments?.length
                        ? Math.max(...a.comments.map(c => new Date(c.commentedDate)))
                        : new Date(a.postedDate);
                    const bLastComment = b.comments?.length
                        ? Math.max(...b.comments.map(c => new Date(c.commentedDate)))
                        : new Date(b.postedDate);
                    return bLastComment - aLastComment;
                });
            case SORT_TYPES.NEWEST:
            default:
                return postsCopy.sort((a, b) =>
                    new Date(b.postedDate) - new Date(a.postedDate)
                );
        }
    }, [posts, sortType]);

    // Helper function to truncate content
    const truncateContent = (content) => {
        if (!content) return '';
        return content.length > 80 ? `${content.substring(0, 80)}...` : content;
    };

    // Display loading message if data is being fetched
    if (isLoading) {
        return <div className="home-page-loading">Loading posts...</div>;
    }

    return (
        <div className="home-page-container">
            {/* Header section with title and sorting buttons */}
            <div className="home-page-header-section">
                <h1 className="home-page-main-header">All Posts</h1>
                <div className="home-page-sort-buttons">
                    <button
                        className={`home-page-sort-button ${sortType === SORT_TYPES.NEWEST ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.NEWEST)}
                        aria-label="Sort by newest"
                    >
                        Newest
                    </button>
                    <button
                        className={`home-page-sort-button ${sortType === SORT_TYPES.OLDEST ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.OLDEST)}
                        aria-label="Sort by oldest"
                    >
                        Oldest
                    </button>
                    <button
                        className={`home-page-sort-button ${sortType === SORT_TYPES.ACTIVE ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.ACTIVE)}
                        aria-label="Sort by most active"
                    >
                        Active
                    </button>
                </div>
            </div>

            {/* Display the number of posts */}
            <p className="home-page-post-count">{sortedPosts.length} posts</p>

            <div className="home-page-header-delimiter" />

            {/* Posts list */}
            <div className="home-page-posts-list">
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                        <article
                            key={post._id}
                            className="home-page-post-card"
                            onClick={() => navigate(`/post/${post._id}`)}
                            role="link"
                            tabIndex={0}
                        >
                            <div className="home-page-post-metadata">
                                {/* Display community name or 'Unknown Community' */}
                                {post.community && post.community.name ? (
                                    <span
                                        className="home-page-community-name"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent parent click event
                                            navigate(`/community/${post.community._id}`);
                                        }}
                                    >
                                        {post.community.name}
                                    </span>
                                ) : (
                                    <span className="home-page-community-name">
                                        Unknown Community
                                    </span>
                                )}
                                <span className="home-page-separator">•</span>
                                <span className="home-page-posted-by">
                                    {post.postedBy || 'Anonymous'}
                                </span>
                                <span className="home-page-separator">•</span>
                                <span className="home-page-timestamp">
                                    {formatTimestamp(new Date(post.postedDate))}
                                </span>
                            </div>

                            {/* Post title */}
                            <h2 className="home-page-post-title">
                                {post.title || 'Untitled Post'}
                            </h2>

                            {/* Display link flair if available */}
                            {post.linkFlair && post.linkFlair.content && (
                                <span className="home-page-link-flair">
                                    {post.linkFlair.content}
                                </span>
                            )}

                            {/* Truncated post content */}
                            <p className="home-page-post-content">
                                {truncateContent(post.content)}
                            </p>

                            {/* Post statistics */}
                            <div className="home-page-post-stats">
                                <span className="home-page-views">
                                    {post.views || 0} views
                                </span>
                                <span className="home-page-separator">•</span>
                                <span className="home-page-comments">
                                    {post.comments?.length || 0} comments
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="home-page-no-posts">
                        No posts available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;

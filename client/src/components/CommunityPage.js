/**
 * CommunityPage Component
 * @module components/CommunityPage
 *
 * @description Displays a specific community's details and its posts.
 * Similar to HomePage but with community-specific information and
 * modified post display format.
 */

import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for HTTP requests
import { useNavigate, useParams } from 'react-router-dom';
import { formatTimestamp } from '../utils/timeUtils';
import '../stylesheets/CommunityPage.css';

const SORT_TYPES = {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    ACTIVE: 'active'
};

const CommunityPage = () => {
    const { communityId } = useParams(); // Get community ID from URL parameters
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null); // State to hold community details
    const [posts, setPosts] = useState([]); // State to hold posts of the community
    const [sortType, setSortType] = useState(SORT_TYPES.NEWEST);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCommunityData = async () => {
            setIsLoading(true);
            try {
                // Fetch community details from the server
                const communityResponse = await axios.get(`http://localhost:8000/api/communities/${communityId}`);
                setCommunity(communityResponse.data);

                // Fetch posts for this community
                const postsResponse = await axios.get(`http://localhost:8000/api/communities/${communityId}/posts`);
                setPosts(postsResponse.data);
            } catch (error) {
                console.error('Error fetching community data:', error);
                // Handle errors appropriately
            } finally {
                setIsLoading(false);
            }
        };

        fetchCommunityData();
    }, [communityId]); // Fetch data when communityId changes

    // Memoize sorted posts based on selected sort type
    const sortedPosts = useMemo(() => {
        if (!posts || posts.length === 0) return [];
        const postsCopy = [...posts];

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

    // Display loading message while data is being fetched
    if (isLoading) {
        return <div className="community-page-loading">Loading community...</div>;
    }

    // Display error message if community is not found
    if (!community) {
        return (
            <div className="community-page-error">
                Community not found. Please check the URL and try again.
            </div>
        );
    }

    return (
        <div className="community-page-container">
            {/* Community header with name, description, and stats */}
            <div className="community-page-header">
                <h1 className="community-page-name">{community.name}</h1>
                <p className="community-page-description">{community.description}</p>
                <p className="community-page-creation">
                    Created {formatTimestamp(new Date(community.startDate))}
                </p>
                <div className="community-page-stats">
                    <span className="community-page-post-count">
                        {sortedPosts.length} posts
                    </span>
                    <span className="community-page-stats-separator">•</span>
                    <span className="community-page-member-count">
                        {community.members?.length || 0} members
                    </span>
                </div>
            </div>

            {/* Sort buttons */}
            <div className="community-page-sort-section">
                <div className="community-page-sort-buttons">
                    <button
                        className={`community-page-sort-button ${sortType === SORT_TYPES.NEWEST ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.NEWEST)}
                        aria-label="Sort by newest"
                    >
                        Newest
                    </button>
                    <button
                        className={`community-page-sort-button ${sortType === SORT_TYPES.OLDEST ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.OLDEST)}
                        aria-label="Sort by oldest"
                    >
                        Oldest
                    </button>
                    <button
                        className={`community-page-sort-button ${sortType === SORT_TYPES.ACTIVE ? 'active' : ''}`}
                        onClick={() => setSortType(SORT_TYPES.ACTIVE)}
                        aria-label="Sort by most active"
                    >
                        Active
                    </button>
                </div>
            </div>

            {/* Posts list */}
            <div className="community-page-posts-list">
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                        <article
                            key={post._id}
                            className="community-page-post-card"
                            onClick={() => navigate(`/post/${post._id}`)}
                            role="link"
                            tabIndex={0}
                        >
                            <div className="community-page-post-metadata">
                                <span className="community-page-posted-by">
                                    {post.postedBy || 'Anonymous'}
                                </span>
                                <span className="community-page-separator">•</span>
                                <span className="community-page-timestamp">
                                    {formatTimestamp(new Date(post.postedDate))}
                                </span>
                            </div>

                            <h2 className="community-page-post-title">{post.title || 'Untitled Post'}</h2>

                            {post.linkFlair && post.linkFlair.content && (
                                <span className="community-page-link-flair">
                                    {post.linkFlair.content}
                                </span>
                            )}

                            <p className="community-page-post-content">
                                {post.content && post.content.length > 80
                                    ? `${post.content.substring(0, 80)}...`
                                    : post.content}
                            </p>

                            <div className="community-page-post-stats">
                                <span className="community-page-views">
                                    {post.views || 0} views
                                </span>
                                <span className="community-page-separator">•</span>
                                <span className="community-page-comments">
                                    {post.comments?.length || 0} comments
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="community-page-no-posts">
                        No posts in this community yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;

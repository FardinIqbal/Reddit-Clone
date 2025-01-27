/**
 * SearchResults Component
 * @module components/SearchResults
 *
 * @description Displays search results based on user query. Searches through
 * post titles, contents, and comments. Each word in the search query is
 * treated as a separate search term.
 */

import React, {useMemo, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {formatTimestamp} from '../utils/timeUtils';
import '../stylesheets/SearchResults.css';

const SORT_TYPES = {
    NEWEST: 'newest', OLDEST: 'oldest', ACTIVE: 'active'
};

/**
 * Determines if a post matches any of the search terms
 * @param {Object} post - Post to search
 * @param {string[]} searchTerms - Array of search terms
 * @returns {boolean} True if post matches any search term
 */
const postMatchesSearch = (post, searchTerms) => {
    const terms = searchTerms.map(term => term.toLowerCase());
    const titleMatch = terms.some(term => post.title.toLowerCase().includes(term));
    const contentMatch = terms.some(term => post.content.toLowerCase().includes(term));
    const commentMatch = post.comments?.some(comment => terms.some(term => comment.content.toLowerCase().includes(term)));
    return titleMatch || contentMatch || commentMatch;
};

const SearchResults = ({posts = []}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sortType, setSortType] = useState(SORT_TYPES.NEWEST);

    const query = searchParams.get('q') || '';
    const searchTerms = query.trim().split(/\s+/);

    const filteredAndSortedPosts = useMemo(() => {
        const matchedPosts = posts.filter(post => postMatchesSearch(post, searchTerms));
        switch (sortType) {
            case SORT_TYPES.OLDEST:
                return [...matchedPosts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
            case SORT_TYPES.ACTIVE:
                return [...matchedPosts].sort((a, b) => {
                    const aLastComment = a.comments?.length ? Math.max(...a.comments.map(c => new Date(c.commentedDate))) : new Date(a.postedDate);
                    const bLastComment = b.comments?.length ? Math.max(...b.comments.map(c => new Date(c.commentedDate))) : new Date(b.postedDate);
                    return bLastComment - aLastComment || new Date(b.postedDate) - new Date(a.postedDate);
                });
            default:
                return [...matchedPosts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        }
    }, [posts, searchTerms, sortType]);

    return (<div className="search-results-page">
        <div className="search-results-header">
            <h1 className="search-results-title">
                {filteredAndSortedPosts.length > 0 ? `Results for: ${query}` : `No results found for: ${query}`}
            </h1>
            {filteredAndSortedPosts.length > 0 && (<div className="search-results-sort-buttons">
                <button
                    className={`search-results-sort-button ${sortType === SORT_TYPES.NEWEST ? 'active' : ''}`}
                    onClick={() => setSortType(SORT_TYPES.NEWEST)}
                    aria-label="Sort by newest"
                >
                    Newest
                </button>
                <button
                    className={`search-results-sort-button ${sortType === SORT_TYPES.OLDEST ? 'active' : ''}`}
                    onClick={() => setSortType(SORT_TYPES.OLDEST)}
                    aria-label="Sort by oldest"
                >
                    Oldest
                </button>
                <button
                    className={`search-results-sort-button ${sortType === SORT_TYPES.ACTIVE ? 'active' : ''}`}
                    onClick={() => setSortType(SORT_TYPES.ACTIVE)}
                    aria-label="Sort by most active"
                >
                    Active
                </button>
            </div>)}
        </div>

        <p className="search-results-post-count">
            {filteredAndSortedPosts.length} posts
        </p>

        {filteredAndSortedPosts.length > 0 ? (<div className="search-results-posts-list">
            {filteredAndSortedPosts.map((post) => (<article
                key={post._id}
                className="search-results-post-card"
                onClick={() => navigate(`/post/${post._id}`)}
                role="link"
                tabIndex={0}
            >
                <div className="search-results-post-metadata">
                                <span className="search-results-community-name">
                                    {post.community.name}
                                </span>
                    <span className="search-results-separator">•</span>
                    <span className="search-results-posted-by">
                                    {post.postedBy}
                                </span>
                    <span className="search-results-separator">•</span>
                    <span className="search-results-timestamp">
                                    {formatTimestamp(new Date(post.postedDate))}
                                </span>
                </div>
                <h2 className="search-results-post-title">{post.title}</h2>
                {post.linkFlair && (<span className="search-results-link-flair">
                                    {post.linkFlair.content}
                                </span>)}
                <p className="search-results-post-content">
                    {post.content.length > 80 ? `${post.content.substring(0, 80)}...` : post.content}
                </p>
                <div className="search-results-post-stats">
                                <span className="search-results-views">
                                    {post.views} views
                                </span>
                    <span className="search-results-separator">•</span>
                    <span className="search-results-comments">
                                    {post.comments?.length || 0} comments
                                </span>
                </div>
            </article>))}
        </div>) : (<div className="search-results-no-results">
            <svg
                className="search-results-no-results-icon"
                viewBox="0 0 24 24"
                width="100"
                height="100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            <p className="search-results-no-results-text">
                No posts match your search criteria
            </p>
        </div>)}
    </div>);
};

export default SearchResults;

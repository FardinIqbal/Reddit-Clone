/**
 * Banner Component
 * @module components/Banner
 *
 * @description Top banner of the Phreddit application containing the app name,
 * search functionality, and post creation button. Present on all pages.
 *
 * Layout requirements:
 * - White background
 * - Left-aligned "phreddit" text in reddish-orange
 * - Centered search box with rounded corners
 * - Right-aligned "Create Post" button
 * - Black line separator below banner
 */

import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../stylesheets/Banner.css';

const Banner = () => {
    // State for search input
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    /**
     * Handle search submission
     * @param {Event} e - Form submission event
     */
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    /**
     * Navigate to home page when clicking app name
     * Non-changing appearance on hover as per requirements
     */
    const handleHomeClick = () => {
        navigate('/');
    };

    return (<div className="banner-component-container">
            <div className="banner-component">
                {/* App name - links to home */}
                <h1
                    className="banner-component-app-name"
                    onClick={handleHomeClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Go to home page"
                >
                    phreddit
                </h1>

                {/* Search form */}
                <form onSubmit={handleSearch} className="banner-component-search-form">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Phreddit..."
                        className="banner-component-search-input"
                        aria-label="Search Phreddit"
                    />
                </form>

                {/* Create Post button */}
                <button
                    className="banner-component-create-post-btn"
                    onClick={() => navigate('/create-post')}
                    aria-label="Create a new post"
                >
                    Create Post
                </button>
            </div>
            {/* Delimiter line */}
            <div className="banner-component-delimiter"/>
        </div>);
};

export default Banner;

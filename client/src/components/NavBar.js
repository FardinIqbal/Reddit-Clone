/**
 * NavBar Component
 * @module components/NavBar
 *
 * @description Vertical navigation bar component containing home link,
 * community creation, and community list. Present on all pages with
 * dynamic highlighting based on current route.
 */

import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import '../stylesheets/NavBar.css';

const NavBar = ({communities = []}) => {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Determine if current path matches given path
     * Used for active state styling
     */
    const isActivePath = (path) => location.pathname === path;

    /**
     * Navigate to community page and handle active states
     * @param {string} communityId - ID of selected community
     */
    const handleCommunityClick = (communityId) => {
        navigate(`/community/${communityId}`);
    };

    return (<nav className="navbar-component">
        {/* Home link section */}
        <div className="navbar-component-section">
            <button
                className={`navbar-component-home-link ${isActivePath('/') ? 'active' : ''}`}
                onClick={() => navigate('/')}
                aria-label="Go to home page"
            >
                Home
            </button>
        </div>

        {/* Delimiter between home and communities */}
        <div className="navbar-component-section-delimiter"/>

        {/* Communities section */}
        <div className="navbar-component-section">
            <h2 className="navbar-component-communities-header">Communities</h2>

            {/* Create community button */}
            <button
                className={`navbar-component-create-community-btn ${isActivePath('/create-community') ? 'active' : ''}`}
                onClick={() => navigate('/create-community')}
                aria-label="Create a new community"
            >
                Create Community
            </button>

            {/* Communities list */}
            <ul className="navbar-component-communities-list">
                {communities.map((community) => (<li key={community._id}>
                    <button
                        className={`navbar-component-community-link ${isActivePath(`/community/${community._id}`) ? 'active' : ''}`}
                        onClick={() => handleCommunityClick(community._id)}
                        aria-label={`Go to ${community.name} community`}
                    >
                        {community.name}
                    </button>
                </li>))}
            </ul>
        </div>
    </nav>);
};

export default NavBar;

/**
 * NewPostPage Component
 * @module components/NewPostPage
 *
 * @description Provides a form for users to create a new post.
 * Users can select a community, enter a title, content, and optionally select or create a link flair.
 * The form includes validation and error handling.
 */

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import '../stylesheets/NewPostPage.css';

const NewPostPage = () => {
    const navigate = useNavigate();

    // Form state
    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [title, setTitle] = useState('');
    const [selectedLinkFlair, setSelectedLinkFlair] = useState('');
    const [newLinkFlair, setNewLinkFlair] = useState('');
    const [content, setContent] = useState('');
    const [postedBy, setPostedBy] = useState('');

    // Error state
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch available communities
        const fetchCommunities = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/communities');
                setCommunities(response.data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };

        // Fetch available link flairs
        const fetchLinkFlairs = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/linkflairs');
                setLinkFlairs(response.data);
            } catch (error) {
                console.error('Error fetching link flairs:', error);
            }
        };

        fetchCommunities();
        fetchLinkFlairs();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!selectedCommunity) {
            newErrors.selectedCommunity = 'Please select a community.';
        }

        if (!title.trim()) {
            newErrors.title = 'Title is required.';
        } else if (title.length > 100) {
            newErrors.title = 'Title cannot exceed 100 characters.';
        }

        if (!content.trim()) {
            newErrors.content = 'Content is required.';
        }

        if (!postedBy.trim()) {
            newErrors.postedBy = 'Username is required.';
        }

        if (newLinkFlair && newLinkFlair.length > 30) {
            newErrors.newLinkFlair = 'New link flair cannot exceed 30 characters.';
        }

        if (selectedLinkFlair && newLinkFlair) {
            newErrors.linkFlair = 'Please select either an existing link flair or create a new one, not both.';
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
            let linkFlairID = null;

            // Handle new link flair creation
            if (newLinkFlair) {
                const linkFlairResponse = await axios.post('http://localhost:8000/api/linkflairs', {
                    content: newLinkFlair.trim(),
                });
                linkFlairID = linkFlairResponse.data._id;
            } else if (selectedLinkFlair) {
                linkFlairID = selectedLinkFlair;
            }

            // Create new post
            const postResponse = await axios.post('http://localhost:8000/api/posts', {
                title: title.trim(),
                content: content.trim(),
                postedBy: postedBy.trim(),
                communityID: selectedCommunity,
                linkFlairID: linkFlairID,
            });

            if (postResponse.status === 201) {
                alert('Post created successfully!');
                navigate('/');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('An error occurred while creating the post. Please try again.');
        }
    };

    return (<div className="np-container">
            <h1 className="np-title">Create a New Post</h1>
            <form className="np-form" onSubmit={handleSubmit}>
                {/* Community Selection */}
                <div className="np-form-group">
                    <label htmlFor="community-select" className="np-label">
                        Select Community <span className="np-required">*</span>
                    </label>
                    <select
                        id="community-select"
                        className="np-select"
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                    >
                        <option value="">-- Select a Community --</option>
                        {communities.map((community) => (<option key={community._id} value={community._id}>
                                {community.name}
                            </option>))}
                    </select>
                    {errors.selectedCommunity && <p className="np-error">{errors.selectedCommunity}</p>}
                </div>

                {/* Post Title */}
                <div className="np-form-group">
                    <label htmlFor="post-title" className="np-label">
                        Post Title <span className="np-required">*</span>
                    </label>
                    <input
                        type="text"
                        id="post-title"
                        className="np-input"
                        value={title}
                        maxLength={100}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && <p className="np-error">{errors.title}</p>}
                </div>

                {/* Link Flair Selection */}
                <div className="np-form-group">
                    <label htmlFor="link-flair-select" className="np-label">Link Flair (Optional)</label>
                    <select
                        id="link-flair-select"
                        className="np-select"
                        value={selectedLinkFlair}
                        onChange={(e) => {
                            setSelectedLinkFlair(e.target.value);
                            setNewLinkFlair('');
                        }}
                    >
                        <option value="">-- Select a Link Flair --</option>
                        {linkFlairs.map((flair) => (<option key={flair._id} value={flair._id}>
                                {flair.content}
                            </option>))}
                    </select>
                </div>

                {/* New Link Flair */}
                <div className="np-form-group">
                    <label htmlFor="new-link-flair" className="np-label">Or Create New Link Flair (Optional)</label>
                    <input
                        type="text"
                        id="new-link-flair"
                        className="np-input"
                        value={newLinkFlair}
                        maxLength={30}
                        onChange={(e) => {
                            setNewLinkFlair(e.target.value);
                            setSelectedLinkFlair('');
                        }}
                    />
                    {errors.newLinkFlair && <p className="np-error">{errors.newLinkFlair}</p>}
                    {errors.linkFlair && <p className="np-error">{errors.linkFlair}</p>}
                </div>

                {/* Post Content */}
                <div className="np-form-group">
                    <label htmlFor="post-content" className="np-label">
                        Post Content <span className="np-required">*</span>
                    </label>
                    <textarea
                        id="post-content"
                        className="np-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    {errors.content && <p className="np-error">{errors.content}</p>}
                </div>

                {/* Username */}
                <div className="np-form-group">
                    <label htmlFor="username" className="np-label">
                        Username <span className="np-required">*</span>
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="np-input"
                        value={postedBy}
                        onChange={(e) => setPostedBy(e.target.value)}
                    />
                    {errors.postedBy && <p className="np-error">{errors.postedBy}</p>}
                </div>

                {/* Submit Button */}
                <button type="submit" className="np-submit">
                    Submit Post
                </button>
            </form>
        </div>);
};

export default NewPostPage;

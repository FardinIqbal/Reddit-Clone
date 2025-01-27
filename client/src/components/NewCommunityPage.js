/**
 * NewCommunityPage Component
 * @module components/NewCommunityPage
 *
 * @description Form component for creating new communities.
 * Handles validation, error display, and community creation via API.
 */

import React, {useState} from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import {useNavigate} from 'react-router-dom';
import '../stylesheets/NewCommunityPage.css';

const NewCommunityPage = ({onCommunityCreated}) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', creatorUsername: ''
    });

    const [errors, setErrors] = useState({
        name: '', description: '', creatorUsername: '', submit: ''
    });

    /**
     * Handle form input changes
     * @param {Event} e - Input change event
     */
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev, [name]: ''
            }));
        }
    };

    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({name: '', description: '', creatorUsername: '', submit: ''});

        // Validate form
        const newErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Community name is required';
            isValid = false;
        } else if (formData.name.length > 100) {
            newErrors.name = 'Community name must not exceed 100 characters';
            isValid = false;
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Community description is required';
            isValid = false;
        } else if (formData.description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
            isValid = false;
        }

        if (!formData.creatorUsername.trim()) {
            newErrors.creatorUsername = 'Creator username is required';
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Make API call to create community
            const response = await axios.post('http://localhost:8000/api/communities', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                creatorUsername: formData.creatorUsername.trim()
            });

            const createdCommunity = response.data;

            // Call the onCommunityCreated callback if provided
            if (onCommunityCreated) {
                onCommunityCreated(createdCommunity);
            }

            // Navigate to the newly created community page
            navigate(`/community/${createdCommunity._id}`);
        } catch (error) {
            console.error('Error creating community:', error);

            // Set submission error
            setErrors(prev => ({
                ...prev, submit: error.response?.data?.message || 'Failed to create community. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (<div className="new-community-container">
        <h1 className="new-community-title">Create a New Community</h1>

        <form className="new-community-form" onSubmit={handleSubmit}>
            {/* Community name input */}
            <div className="new-community-form-group">
                <label className="new-community-label" htmlFor="name">
                    Community Name
                    <span className="new-community-required">*</span>
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    className={`new-community-input ${errors.name ? 'new-community-input-error' : ''}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter community name"
                />
                {errors.name && <span className="new-community-error">{errors.name}</span>}
                <span className="new-community-char-count">
                        {formData.name.length}/100
                    </span>
            </div>

            {/* Community description input */}
            <div className="new-community-form-group">
                <label className="new-community-label" htmlFor="description">
                    Description
                    <span className="new-community-required">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    className={`new-community-textarea ${errors.description ? 'new-community-input-error' : ''}`}
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={500}
                    placeholder="Enter community description"
                    rows={4}
                />
                {errors.description && <span className="new-community-error">{errors.description}</span>}
                <span className="new-community-char-count">
                        {formData.description.length}/500
                    </span>
            </div>

            {/* Creator username input */}
            <div className="new-community-form-group">
                <label className="new-community-label" htmlFor="creatorUsername">
                    Creator Username
                    <span className="new-community-required">*</span>
                </label>
                <input
                    id="creatorUsername"
                    name="creatorUsername"
                    type="text"
                    className={`new-community-input ${errors.creatorUsername ? 'new-community-input-error' : ''}`}
                    value={formData.creatorUsername}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                />
                {errors.creatorUsername && <span className="new-community-error">{errors.creatorUsername}</span>}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                className="new-community-submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating Community...' : 'Engender Community'}
            </button>

            {/* General submission error */}
            {errors.submit && (<div className="new-community-submit-error" role="alert">
                {errors.submit}
            </div>)}
        </form>
    </div>);
};

export default NewCommunityPage;

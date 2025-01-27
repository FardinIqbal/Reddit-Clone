import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Banner from './components/Banner';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import CommunityPage from './components/CommunityPage';
import SearchResults from './components/SearchResults';
import PostPage from './components/PostPage';
import NewCommunityPage from './components/NewCommunityPage';
import NewPostPage from './components/NewPostPage';
import NewCommentPage from './components/NewCommentPage'; // Import the NewCommentPage component
import './stylesheets/App.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
    const [communities, setCommunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [communitiesRes, postsRes] = await Promise.all([axios.get(`${API_BASE_URL}/communities`), axios.get(`${API_BASE_URL}/posts`)]);

                setCommunities(communitiesRes.data);
                setPosts(postsRes.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * Increment view count for a specific post
     * @param {string} postId - ID of post to increment views for
     */
    const incrementViewCount = async (postId) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/posts/${postId}/views`);
            setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? response.data : post)));
        } catch (err) {
            console.error('Error incrementing view count:', err);
        }
    };

    /**
     * Handle community creation
     * @param {Object} newCommunity - Newly created community
     */
    const handleCommunityCreated = (newCommunity) => {
        setCommunities((prevCommunities) => [...prevCommunities, newCommunity]);
    };

    /**
     * Handle new post creation
     * @param {Object} newPost - Newly created post
     */
    const handlePostCreated = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (<Router>
            <div className="app">
                <Banner/>
                <div className="content-wrapper">
                    <NavBar communities={communities}/>
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<HomePage posts={posts}/>}/>
                            <Route path="/community/:communityId" element={<CommunityPage/>}/>
                            <Route path="/search" element={<SearchResults posts={posts}/>}/>
                            <Route
                                path="/post/:postId"
                                element={<PostPage incrementViewCount={incrementViewCount}/>}
                            />
                            <Route
                                path="/create-community"
                                element={<NewCommunityPage onCommunityCreated={handleCommunityCreated}/>}
                            />
                            <Route
                                path="/create-post"
                                element={<NewPostPage communities={communities} onPostCreated={handlePostCreated}/>}
                            />
                            <Route path="/post/:postId/comment" element={<NewCommentPage/>}/>
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>);
}

export default App;

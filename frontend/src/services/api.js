import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Use relative path to avoid CORS/Cookie domain issues
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json', // API Platform default
    }
});

export default api;

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Point to Symfony API
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json', // API Platform default
    }
});

export default api;

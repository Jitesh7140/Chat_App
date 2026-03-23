import axios from 'axios';

// Vite mein 'VITE_' prefix zaroori hai
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
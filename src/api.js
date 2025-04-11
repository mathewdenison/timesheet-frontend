import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_PUBLIC_BASE_URL,
    withCredentials: true, // Include cookies if necessary
});

export default API;
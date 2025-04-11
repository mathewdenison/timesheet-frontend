import axios from "axios";

const API = axios.create({
    baseURL: "http://dashboard-service.default.svc.cluster.local:8000/api/user",
    withCredentials: true, // Include session cookies for authentication
});

export default API;
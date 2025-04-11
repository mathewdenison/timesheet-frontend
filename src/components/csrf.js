import axios from "axios";

// Helper function to get a specific cookie from the browser
const getCookie = (name) => {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
};

// Axios interceptor to add CSRFToken to request headers
export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use((config) => {
        // Get the CSRF token from the csrftoken cookie
        const csrfToken = getCookie("csrftoken");

        if (csrfToken) {
            // Add the CSRF token to the headers
            config.headers["X-CSRFToken"] = csrfToken;
        }
        return config;
    });
};

// Optional: Function to fetch the CSRF cookie explicitly (use if needed on initialization)
export const initializeCsrf = async () => {
    try {
        await axios.get("https://127.0.0.1:8000/api/user/csrf_setup/", {
            withCredentials: true, // Ensure the cookie is included in the response
        });
        console.log("CSRF token initialized and cookie set.");
    } catch (err) {
        console.error("Failed to fetch and set CSRF token:", err);
    }
};
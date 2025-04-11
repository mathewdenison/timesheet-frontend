import React from "react";
import axios from "axios";
import { getSocket } from "../socket"; // Import the socket helper

function Logout({ setLoggedIn }) {
    const baseURL = process.env.REACT_APP_PUBLIC_BASE_URL;

    const logoutUser = async () => {
        try {
            // Disconnect the socket if it exists.
            const socket = getSocket();
            if (socket) {
                socket.close();
                console.log("Socket disconnected on logout");
            }

            // Send request to logout endpoint.
            await axios.post(
                `${baseURL}api/user/logout/`,
                {}, // No payload needed.
                { withCredentials: true }
            );

            // Clean up localStorage and update state.
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("employeeId");
            localStorage.removeItem("role");
            setLoggedIn(false);
            console.log("User logged out");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return <button onClick={logoutUser}>Logout</button>;
}

export default Logout;

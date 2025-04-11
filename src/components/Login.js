import React, { useEffect, useState } from "react";
import axios from "axios";
import Timesheet from "./Timesheet";
import HRDashboard from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { connectSocket } from "../socket";
import { RefreshProvider } from "../contexts/RefreshContext";

function Login() {
    // normal state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const baseURL = process.env.REACT_APP_PUBLIC_BASE_URL;

    // persisted state
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const savedState = localStorage.getItem("isLoggedIn");
        return savedState ? JSON.parse(savedState) : false;
    });
    const [employeeId, setEmployeeId] = useState(() => {
        const savedState = localStorage.getItem("employeeId");
        return savedState ? JSON.parse(savedState) : null;
    });
    const [role, setRole] = useState(() => {
        const savedState = localStorage.getItem("role");
        return savedState ? savedState : "";
    });

    useEffect(() => {
        localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
        localStorage.setItem("employeeId", JSON.stringify(employeeId));
        localStorage.setItem("role", role);
    }, [isLoggedIn, employeeId, role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Send the username and password to the backend
            const response = await axios.post(
                `${baseURL}api/user/login/`,
                { username, password },
                { withCredentials: true }
            );

            const { role, csrf_token, employee_id, message } = response.data;
            if (employee_id && csrf_token) {
                connectSocket(employee_id, csrf_token);
            }

            console.log("Received CSRF Token:", csrf_token);

            // Update state variables
            setRole(role);
            setCsrfToken(csrf_token);
            setEmployeeId(employee_id);
            setMessage(message);
            setIsLoggedIn(true);
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            setMessage("Login failed. Please try again.");
        }
    };

    // Once logged in, wrap the dashboard components with the RefreshProvider.
    if (isLoggedIn && employeeId && role) {
        return (
            <RefreshProvider>
                {role === "Employee" && (
                    <Timesheet employeeId={employeeId} csrfToken={csrfToken} setIsLoggedIn={setIsLoggedIn} />
                )}
                {role === "HR" && (
                    <>
                        <Timesheet employeeId={employeeId} csrfToken={csrfToken} setIsLoggedIn={setIsLoggedIn} />
                        <EmployeeDashboard setIsLoggedIn={setIsLoggedIn} />
                        <HRDashboard setIsLoggedIn={setIsLoggedIn} />
                    </>
                )}
                {role === "Manager" && (
                    <>
                        <Timesheet employeeId={employeeId} csrfToken={csrfToken} setIsLoggedIn={setIsLoggedIn} />
                        <EmployeeDashboard setIsLoggedIn={setIsLoggedIn} />
                    </>
                )}
            </RefreshProvider>
        );
    }

    return (
        <div>
            <h2>Login</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleLogin}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;

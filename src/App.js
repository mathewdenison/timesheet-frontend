import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/Login";
import EmployeeDashboard from "./components/EmployeeDashboard";
import Logout from "./components/Logout";
import HRDashboard from "./components/HRDashboard";
import Timesheet from "./components/Timesheet";
import EditTimeLog from "./components/EditTimeLog";
import { RefreshProvider, useRefresh } from "./contexts/RefreshContext";

function AppContent({ loggedIn, setLoggedIn, setUserRole }) {
    // Trigger a refresh on mount to ensure data is re-fetched.
    const { triggerRefresh } = useRefresh();

    useEffect(() => {
        triggerRefresh();
    }, [triggerRefresh]);

    return (
        <div className="App">
            {!loggedIn ? (
                <Login setLoggedIn={setLoggedIn} setUserRole={setUserRole} />
            ) : (
                <>
                    <Logout setLoggedIn={setLoggedIn} />
                    <Routes>
                        <Route path="hrdashboard" element={<HRDashboard />} />
                        <Route path="timesheets" element={<Timesheet />} />
                        <Route path="/" element={<EmployeeDashboard />} >
                            <Route path="timelogs/edit/:id/*" element={<EditTimeLog />} />
                        </Route>
                    </Routes>
                </>
            )}
        </div>
    );
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("");

    return (
        <RefreshProvider>
            <Router>
                <AppContent loggedIn={loggedIn} setLoggedIn={setLoggedIn} setUserRole={setUserRole} />
            </Router>
        </RefreshProvider>
    );
}

export default App;

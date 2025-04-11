import React, { useState, useEffect } from "react";
import axios from "axios";
import Logout from "./Logout";
import { useRefresh } from "../contexts/RefreshContext"; // Import our custom hook
import './Timesheet.css';

function dateFromStr(dateStr) {
    if (dateStr instanceof Date) {
        return dateStr;
    }
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function Timesheet({ employeeId, csrfToken, setIsLoggedIn }) {
    const [ptoHours, setPtoHours] = useState(0);
    const [ptoBalance, setPtoBalance] = useState(0);
    const baseURL = process.env.REACT_APP_PUBLIC_BASE_URL;
    const [timesheetData, setTimesheetData] = useState({
        week_start_date: new Date(),
        week_end_date: new Date(),
        monday_hours: "",
        tuesday_hours: "",
        wednesday_hours: "",
        thursday_hours: "",
        friday_hours: "",
        pto_hours: 0,
    });

    // Use our refresh context to trigger re-fetching of data.
    const { refreshFlag, triggerRefresh } = useRefresh();

    const fetchInitialData = async () => {
        try {
            const responseForWeek = await axios.get(`${baseURL}api/user/payPeriod`);
            const weekStartDate = responseForWeek.data.week_start_date;
            const weekEndDate = responseForWeek.data.week_end_date;

            const responseForPtoBalance = await axios.get(`${baseURL}api/user/ptoBalance?employee_id=${employeeId}`);
            setPtoBalance(responseForPtoBalance.data.pto_balance);

            setTimesheetData((prevData) => ({
                ...prevData,
                week_start_date: weekStartDate,
                week_end_date: weekEndDate
            }));
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    useEffect(() => {
        fetchInitialData();

        if (csrfToken) {
            console.log("Overriding csrftoken cookie in Timesheet.");
            document.cookie = `csrftoken=${csrfToken}; path=/api/user/csrf; domain=34.133.98.208; SameSite=Lax`;
        }
    }, [csrfToken, employeeId]);

    // Listen for a custom "dashboardRefresh" event to trigger a refresh.
    useEffect(() => {
        const handleRefreshEvent = () => {
            console.log("Dashboard refresh event received in Timesheet.");
            triggerRefresh();
        };

        window.addEventListener("dashboardRefresh", handleRefreshEvent);
        return () => window.removeEventListener("dashboardRefresh", handleRefreshEvent);
    }, [triggerRefresh]);

    // Listen for a "dashboardUpdate" event and update PTO balance if type is "pto_lookup"
    useEffect(() => {
        const handleDashboardUpdate = (e) => {
            const update = e.detail;
            console.log("Dashboard update received:", update);
            if (update.type === "pto_lookup" && String(update.employee_id) === String(employeeId)) {
                console.log("Received PTO lookup update via WebSocket, updating PTO balance to:", update.payload.pto_balance);
                setPtoBalance(update.payload.pto_balance);
            }
        };

        window.addEventListener("dashboardUpdate", handleDashboardUpdate);
        return () => window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
    }, [employeeId]);

    // Re-fetch data whenever refreshFlag or employeeId changes.
    useEffect(() => {
        console.log("Refresh flag updated in Timesheet, re-fetching data...");
        fetchInitialData();
    }, [refreshFlag, employeeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${baseURL}api/user/employees/${employeeId}/submit_timesheet/`,
                { ...timesheetData, employee: employeeId, pto_hours: ptoHours },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                }
            );
            console.log("Timesheet submitted:", response.data);
            alert("Timesheet submitted successfully!");
        } catch (err) {
            console.error("Error submitting timesheet:", err);
            alert("Error submitting timesheet. Please try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if(name === 'ptoHours') {
            setPtoHours(value);
            setTimesheetData((prevData) => ({
                ...prevData,
                pto_hours: value,
            }));
        } else {
            setTimesheetData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    return (
        <div>
            <h2>Submit Timesheet</h2>
            <h3>PTO Balance: {ptoBalance}</h3>
            <h3>Week Start Date: {dateFromStr(timesheetData.week_start_date).toDateString()}</h3>
            <h3>Week End Date: {dateFromStr(timesheetData.week_end_date).toDateString()}</h3>
            <div className="logout-button">
                <Logout setLoggedIn={setIsLoggedIn} />
            </div>
            <form onSubmit={handleSubmit}>
                <br/>
                <label>
                    Monday Hours:
                    <input
                        type="number"
                        name="monday_hours"
                        value={timesheetData.monday_hours}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Tuesday Hours:
                    <input
                        type="number"
                        name="tuesday_hours"
                        value={timesheetData.tuesday_hours}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Wednesday Hours:
                    <input
                        type="number"
                        name="wednesday_hours"
                        value={timesheetData.wednesday_hours}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Thursday Hours:
                    <input
                        type="number"
                        name="thursday_hours"
                        value={timesheetData.thursday_hours}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Friday Hours:
                    <input
                        type="number"
                        name="friday_hours"
                        value={timesheetData.friday_hours}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    PTO Hours:
                    <input
                        type="number"
                        name="ptoHours"
                        value={ptoHours}
                        onChange={(e) => setPtoHours(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Submit Timesheet</button>
            </form>
        </div>
    );
}

export default Timesheet;

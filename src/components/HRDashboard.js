import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRefresh } from "../contexts/RefreshContext"; // Import the custom hook

function HRDashboard() {
    const [employees, setEmployees] = useState([]);
    const [bulkPTO, setBulkPTO] = useState([]); // Contains PTO records: { employee_id, pto_balance }
    const [message, setMessage] = useState("");
    const baseURL = process.env.REACT_APP_PUBLIC_BASE_URL;

    // Get the refresh flag from our RefreshContext.
    const { refreshFlag } = useRefresh();

    // Fetch the employee list.
    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${baseURL}api/user/employees/`, {
                withCredentials: true,
            });
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setMessage("Failed to fetch employees.");
        }
    };

    // Fetch bulk PTO data.
    const fetchBulkPTO = async () => {
        try {
            const response = await axios.post(`${baseURL}api/user/bulk_pto/`, {
                withCredentials: true,
            });
            // Expecting response.data.pto_records to be an array of objects.
            setBulkPTO(response.data.pto_records || []);
        } catch (error) {
            console.error("Error fetching bulk PTO data:", error);
            setMessage("Failed to fetch PTO data.");
        }
    };

    // Combined data fetch.
    const fetchAllData = async () => {
        await fetchEmployees();
        await fetchBulkPTO();
    };

    // Initial fetch when component mounts.
    useEffect(() => {
        fetchAllData();
    }, []);

    // Re-fetch data whenever the refresh flag changes.
    useEffect(() => {
        console.log("Refresh flag updated in HRDashboard, re-fetching data...");
        fetchAllData();
    }, [refreshFlag]);

    // Listen for real-time socket updates for bulk PTO.
    useEffect(() => {
        const handleDashboardUpdate = (e) => {
            const update = e.detail;
            console.log("Socket dashboardUpdate event received:", update);
            if (update.type === "bulk_pto_lookup" && update.payload && update.payload.pto_records) {
                // Update the bulkPTO state with the data from the socket message.
                setBulkPTO(update.payload.pto_records);
                console.log("Updated bulkPTO from socket message:", update.payload.pto_records);
            }
        };

        window.addEventListener("dashboardUpdate", handleDashboardUpdate);
        return () => window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
    }, []);

    const updatePTO = async (employeeId) => {
        // Find the updated PTO value for this employee.
        const record = bulkPTO.find((r) => String(r.employee_id) === String(employeeId));
        if (!record) {
            setMessage(`No PTO record found for Employee ID: ${employeeId}`);
            return;
        }
        const newBalance = record.pto_balance;
        try {
            await axios.patch(
                `${baseURL}api/user/employees/${employeeId}/pto/`,
                { pto_balance: newBalance },
                { withCredentials: true }
            );
            setMessage(`PTO updated for Employee ID: ${employeeId}`);
        } catch (err) {
            setMessage("Failed to update PTO.");
            console.error(err);
        }
    };

    return (
        <div>
            <h2>HR Dashboard</h2>
            {message && <p>{message}</p>}
            <table border="1">
                <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>PTO Balance</th>
                    <th>Update PTO</th>
                </tr>
                </thead>
                <tbody>
                {employees.length > 0 ? (
                    employees.map((employee) => {
                        // Find the bulk PTO record matching the employee's id.
                        const bulkRecord = bulkPTO.find(
                            (record) => String(record.employee_id) === String(employee.id)
                        );
                        // Use the bulk record's PTO balance if found; otherwise fallback to employee.pto_balance.
                        const balance = bulkRecord ? bulkRecord.pto_balance : employee.pto_balance;
                        return (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>{employee.name}</td>
                                <td>{employee.email}</td>
                                <td>{balance}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={bulkRecord ? bulkRecord.pto_balance : ""}
                                        onChange={(e) =>
                                            setBulkPTO(
                                                bulkPTO.map((record) =>
                                                    String(record.employee_id) === String(employee.id)
                                                        ? { ...record, pto_balance: e.target.value }
                                                        : record
                                                )
                                            )
                                        }
                                    />
                                    <button onClick={() => updatePTO(employee.id)}>
                                        Update
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="5">No employees found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default HRDashboard;

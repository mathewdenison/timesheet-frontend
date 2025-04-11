let socket;

export const connectSocket = (employee_id, auth_token) => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    // Use the public IP from your ingress
    const host = "34.133.98.208";
    // Update the path if needed (this example uses /ws/dashboard)
    const wsUrl = `${protocol}://${host}/ws/dashboard?employee_id=${employee_id}&auth_token=${auth_token}`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
        console.log("Received:", event.data);
        const update = JSON.parse(event.data);
        const dashboardEvent = new CustomEvent("dashboardUpdate", { detail: update });
        window.dispatchEvent(dashboardEvent);
    };

    socket.onmessage = (event) => {
        console.log("Received:", event.data);
        const data = JSON.parse(event.data);
        if (data.type && data.type === "refresh_data") {
            // Dispatch a custom event that our RefreshProvider hook or child components can listen for.
            window.dispatchEvent(new CustomEvent("dashboardRefresh"));
        } else {
            // For other message types, dispatch a standard update event.
            const dashboardEvent = new CustomEvent("dashboardUpdate", { detail: data });
            window.dispatchEvent(dashboardEvent);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
        console.error("WebSocket connection error:", error);
    };

    return socket;
};

export const getSocket = () => socket;

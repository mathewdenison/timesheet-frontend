import React, { createContext, useContext, useState, useCallback } from "react";

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
    const [refreshFlag, setRefreshFlag] = useState(0);

    // This function triggers a refresh by updating the flag.
    const triggerRefresh = useCallback(() => {
        console.log("Refresh triggered in RefreshContext");
        setRefreshFlag((prev) => prev + 1);
    }, []);

    return (
        <RefreshContext.Provider value={{ refreshFlag, triggerRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
};

export const useRefresh = () => useContext(RefreshContext);

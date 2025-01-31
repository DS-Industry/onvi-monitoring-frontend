import React from "react";
import { Outlet } from "react-router-dom";
import { ContextProvider } from "@/components/context/Context.tsx";

const PublicLayout: React.FC = () => {
    return (
        <ContextProvider>
            <main>
                <Outlet />
            </main>
        </ContextProvider>
    );
};

export default PublicLayout;

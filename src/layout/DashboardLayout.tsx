import React from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "@/layout/SideNavbar.tsx";
import { ContextProvider } from "@/components/context/Context.tsx";

const DashboardLayout: React.FC = () => {
  return (
    <ContextProvider>
        <SideNavbar>
          <main>
            <Outlet />
          </main>
        </SideNavbar>
    </ContextProvider>
  );
};

export default DashboardLayout;

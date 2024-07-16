import React from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";

const Root: React.FC = () => {
  return (
    <SideNavbar>
      <main>
        <Outlet />
      </main>
    </SideNavbar>
  );
};

export default Root;

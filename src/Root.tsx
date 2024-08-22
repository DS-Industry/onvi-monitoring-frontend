import React from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";
import {ContextProvider} from "./components/context/Context.tsx";

const Root: React.FC = () => {
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

export default Root;

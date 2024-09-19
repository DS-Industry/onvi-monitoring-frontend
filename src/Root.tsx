import React from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "./components/SideNavbar";
import { ContextProvider } from "./components/context/Context.tsx";
import useAuthStore from "./store/authSlice.ts";
import LogIn from "./pages/LogIn.tsx";

const Root: React.FC = () => {
  const { tokens } = useAuthStore();
  return (
    <ContextProvider>
      {tokens?.accessToken == null ? <LogIn /> : (
        <SideNavbar>
          <main>
            <Outlet />
          </main>
        </SideNavbar>)
      }
    </ContextProvider>
  );
};

export default Root;

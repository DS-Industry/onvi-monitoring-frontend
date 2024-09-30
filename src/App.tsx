import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import PrivateRoute from "@/routes/PrivateRoute";
import PublicRoute from "@/routes/PublicRoute";
import DashboardLayout from "@/layout/DashboardLayout";
import LogIn from "@/pages/LogIn";
import SignUp from "@/pages/SignUp";
import { Can } from "@/permissions/Can";

const App: React.FC = () => {
  const [userPermissions, setUserPermissions] = useState<
    { object: string; action: string }[]
  >([]);

  useEffect(() => {
    // Fetch or update user permissions (this could be from an API or auth context)
    const fetchedPermissions = [
      { object: "Pos", action: "create" },
      { object: "Pos", action: "update" },
      { object: "Finance", action: "view" },
    ];
    setUserPermissions(fetchedPermissions);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute element={<LogIn />} />} />
        <Route path="/signup" element={<PublicRoute element={<SignUp />} />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute element={<DashboardLayout />} />}>
          {routes.map((route) => (
            <Route
              key={route.link}
              path={route.link}
              element={
                <Can
                  requiredPermissions={route.permissions || []}
                  userPermissions={userPermissions}
                >
                  {(allowed) =>
                    allowed ? (
                      <route.component />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                </Can>
              }
            />
          ))}

          {/* Sub Navigation Routes */}
          {routes.map(
            (route) =>
              route.subNav &&
              route.subNav.map((subRoute) => (
                <Route
                  key={subRoute.path}
                  path={subRoute.path}
                  element={
                    <Can
                      requiredPermissions={subRoute.permissions || []}
                      userPermissions={userPermissions}
                    >
                      {(allowed) =>
                        allowed ? (
                          <subRoute.component />
                        ) : (
                          <Navigate to="/login" replace />
                        )
                      }
                    </Can>
                  }
                />
              ))
          )}
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

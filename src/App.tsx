import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import PrivateRoute from "@/routes/PrivateRoute";
import PublicRoute from "@/routes/PublicRoute";
import DashboardLayout from "@/layout/DashboardLayout";
import { Can } from "@/permissions/Can";
import useAuthStore from '@/config/store/authSlice';

const App: React.FC = () => {
  const [userPermissions, setUserPermissions] = useState<
    { object: string; action: string }[]
  >([]);

  const fetchedPermissions = useAuthStore((state) => state.permissions);

  useEffect(() => {
    // Fetch or update user permissions (this could be from an API or auth context)
    setUserPermissions(fetchedPermissions);
  },[fetchedPermissions]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {routes.map((route) => 
          route.isPublicRoute && (
            <Route
              key={route.link}
              path={route.link}
              element={<PublicRoute element={<route.component />} />}
            />
          )
        )}
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
                      <Navigate to="/" replace />
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
                          <Navigate to="/" replace />
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

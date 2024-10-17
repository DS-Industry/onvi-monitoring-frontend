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
    setUserPermissions(fetchedPermissions);
  }, [fetchedPermissions]);

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
          {routes.map((route) => {
            const hasSubNav = route.subNav && route.subNav.length > 0;

            return (
              <Route
                key={route.link}
                path={route.link}
                element={
                  hasSubNav ? (
                    <Can
                      requiredPermissions={route.permissions || []}
                      userPermissions={userPermissions}
                    >
                      {(allowed) =>
                        allowed ? (
                          // Check permissions for the first subNav item
                          <Can
                            requiredPermissions={route.subNav[0].permissions || []}
                            userPermissions={userPermissions}
                          >
                            {(subNavAllowed) =>
                              subNavAllowed ? (
                                <Navigate to={route.subNav[0].path} replace />
                              ) : (
                                <Navigate to="/" replace />
                              )
                            }
                          </Can>
                        ) : (
                          <Navigate to="/" replace />
                        )
                      }
                    </Can>
                  ) : (
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
                  )
                }
              />
            );
          })}

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


import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";
import PrivateRoute from "@/routes/PrivateRoute";
import PublicRoute from "@/routes/PublicRoute";
import DashboardLayout from "@/layout/DashboardLayout";
import { Can } from "@/permissions/Can";
import 'react-loading-skeleton/dist/skeleton.css';
// import { usePermissions } from "./hooks/useAuthStore";
import PublicLayout from "./layout/PublicLayout";
import useAuthStore from "./config/store/authSlice";

const App: React.FC = () => {
  const userPermissions = useAuthStore((state) => state.permissions);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute element={<PublicLayout />} />}>
          {routes.map((route) =>
            route.isPublicRoute && (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            )
          )}
        </Route>
        {/* Private Routes */}
        <Route element={<PrivateRoute element={<DashboardLayout />} />}>
          {routes.map((route) => {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  (
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
          {routes.map(
            (route) =>
              route.subNav &&
              route.subNav.map((subRoute) => subRoute.subNav && subRoute.subNav.map((subSubRoute) =>
                <Route
                  key={subSubRoute.path}
                  path={subSubRoute.path}
                  element={
                    <Can
                      requiredPermissions={subSubRoute.permissions || []}
                      userPermissions={userPermissions}
                    >
                      {(allowed) =>
                        allowed ? (
                          <subSubRoute.component />
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
    </HashRouter>
  );
};

export default App;

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import routes from '@/routes';
import { Can } from '@/permissions/Can';
import 'react-loading-skeleton/dist/skeleton.css';
// import { usePermissions } from "./hooks/useAuthStore";
import useAuthStore from './config/store/authSlice';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { datadogLogs } from '@datadog/browser-logs';
import { useFirebaseMessaging } from './hooks/useFirebaseMessaging';
import { requestFirebaseNotificationPermission } from './utils/requestPermission';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
const PublicLayout = React.lazy(() => import('./layout/PublicLayout'));
const PublicRoute = React.lazy(() => import('@/routes/PublicRoute'));
const PrivateRoute = React.lazy(() => import('@/routes/PrivateRoute'));
import useSWRMutation from 'swr/mutation';
import { updateUserProfile } from './services/api/platform';
const DashboardLayout = React.lazy(() => import('@/layout/DashboardLayout'));
import { ConfigProvider } from 'antd';
import ruRU from 'antd/es/locale/ru_RU';
import enUS from 'antd/es/locale/en_US';
import { useTranslation } from 'react-i18next';

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

function ErrorFallback({ resetError, error }: ErrorFallbackProps) {
  return (
    <p>
      Oops, something went wrong! <strong>{error.message}</strong>{' '}
      <button onClick={resetError}>Retry</button>
    </p>
  );
}

const App: React.FC = () => {
  const { i18n } = useTranslation();

  const antdLocale = i18n.language.startsWith('ru') ? ruRU : enUS;
  const userPermissions = useAuthStore(state => state.permissions);

  useFirebaseMessaging();

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { trigger: updateUser } = useSWRMutation(
    isAuthenticated ? 'user' : null,
    async () =>
      updateUserProfile(
        {
          fcmToken: localStorage.getItem('fcmToken') || '',
        },
        null
      )
  );

  useEffect(() => {
    const getTokenAndUpdate = async () => {
      if (!isAuthenticated) return; // Skip if not authenticated

      const result = await requestFirebaseNotificationPermission();
      if (result) {
        localStorage.setItem('fcmToken', result);
        datadogLogs.logger.info('FCM Token received', {
          fcmToken: result,
        });
        updateUser(); // Trigger only after token + permission
      }
    };

    getTokenAndUpdate();
  }, [updateUser, isAuthenticated]);

  return (
    <ChunkErrorBoundary>
      <ErrorBoundary fallback={ErrorFallback}>
        <ConfigProvider locale={antdLocale}>
          <BrowserRouter basename={'/'}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute element={<PublicLayout />} />}>
                {routes.map(
                  route =>
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
                {routes.map(route => {
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Can
                          requiredPermissions={route.permissions || []}
                          userPermissions={userPermissions}
                        >
                          {allowed => {
                            if (!allowed) {
                              datadogLogs.logger.warn('Permission denied', {
                                route: route.path,
                                userPermissions,
                                required: route.permissions,
                              });
                            }
                            return allowed ? (
                              <route.component />
                            ) : (
                              <Navigate to="/" replace />
                            );
                          }}
                        </Can>
                      }
                    />
                  );
                })}

                {/* Sub Navigation Routes */}
                {routes.map(
                  route =>
                    route.subNav &&
                    route.subNav.map(subRoute => (
                      <Route
                        key={subRoute.path}
                        path={subRoute.path}
                        element={
                          <Can
                            requiredPermissions={subRoute.permissions || []}
                            userPermissions={userPermissions}
                          >
                            {allowed => {
                              if (!allowed) {
                                datadogLogs.logger.warn('Permission denied', {
                                  route: subRoute.path,
                                  userPermissions,
                                  required: subRoute.permissions,
                                });
                              }
                              return allowed ? (
                                <subRoute.component />
                              ) : (
                                <Navigate to="/" replace />
                              );
                            }}
                          </Can>
                        }
                      />
                    ))
                )}
                {routes.map(
                  route =>
                    route.subNav &&
                    route.subNav.map(
                      subRoute =>
                        subRoute.subNav &&
                        subRoute.subNav.map(subSubRoute => (
                          <Route
                            key={subSubRoute.path}
                            path={subSubRoute.path}
                            element={
                              <Can
                                requiredPermissions={
                                  subSubRoute.permissions || []
                                }
                                userPermissions={userPermissions}
                              >
                                {allowed => {
                                  if (!allowed) {
                                    datadogLogs.logger.warn(
                                      'Permission denied',
                                      {
                                        route: subSubRoute.path,
                                        userPermissions,
                                        required: subSubRoute.permissions,
                                      }
                                    );
                                  }
                                  return allowed ? (
                                    <subSubRoute.component />
                                  ) : (
                                    <Navigate to="/" replace />
                                  );
                                }}
                              </Can>
                            }
                          />
                        ))
                    )
                )}
              </Route>

              {/* Fallback route */}
              <Route
                path="*"
                element={
                  <>
                    {datadogLogs.logger.warn('Invalid route accessed', {
                      pathname: window.location.hash,
                    })}
                    <Navigate to="/login" replace />
                  </>
                }
              />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </ErrorBoundary>
    </ChunkErrorBoundary>
  );
};

export default App;

import axios from 'axios';
import useAuthStore from '@/config/store/authSlice';
import i18n from '@/config/i18n';
import { datadogLogs } from '@datadog/browser-logs';
import { getCookie, clearCookie } from '@/utils/cookies';
import { getCsrfToken } from '@/services/api/platform';

let showToast: (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning'
) => void;

export const setToastFunction = (toastFunction: typeof showToast) => {
  showToast = toastFunction;
};

const handleLogout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/user/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Server logout failed:', error);
  }

  localStorage.clear();
  sessionStorage.clear();
  clearCookie('csrf-token');

  const logout = useAuthStore.getState().logout;
  logout();
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  config => {
    datadogLogs.logger.info('API Request Initiated', {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString(),
    });

    if (
      ['post', 'put', 'patch', 'delete'].includes(
        config.method?.toLowerCase() || ''
      )
    ) {
      const csrfToken = getCookie('csrf-token');
      if (csrfToken) {
        config.headers['_csrf'] = csrfToken;
      }
    }

    return config;
  },
  error => {
    datadogLogs.logger.error('Request setup error', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return Promise.reject(error);
  }
);

const getTranslatedError = (code: number) => i18n.t(`errors.${String(code)}`);

api.interceptors.response.use(
  response => {
    datadogLogs.logger.info('API Response Received', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  async error => {
    const url = error.config?.url;
    const method = error.config?.method;
    const status = error.response?.status || 'No Response';
    const code = error.response?.data?.code || null;

    datadogLogs.logger.error('API Error', {
      url,
      method,
      status,
      code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    if (!showToast) {
      console.error('Toast function is not initialized.');
      return Promise.reject(error);
    }

    const isCSRFError =
      error.response?.data?.code === 574 &&
      error.response?.data?.message === 'invalid csrf token';

    if (isCSRFError) {
      const originalRequest = error.config;

      if (
        originalRequest._csrfRetry ||
        originalRequest.url?.includes('/user/auth/csrf-token')
      ) {
        datadogLogs.logger.error('CSRF token refresh failed', {
          status: error.response?.status,
          code: error.response?.data?.code,
          message: error.response?.data?.message,
          url: originalRequest.url,
          timestamp: new Date().toISOString(),
        });
        showToast('Session expired. Please refresh the page.', 'error');
        return Promise.reject(error);
      }

      originalRequest._csrfRetry = true;

      try {
        datadogLogs.logger.info('Attempting CSRF token refresh', {
          status: error.response?.status,
          code: error.response?.data?.code,
          message: error.response?.data?.message,
          url: originalRequest.url,
          timestamp: new Date().toISOString(),
        });

        await getCsrfToken();

        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }

        const newCsrfToken = getCookie('csrf-token');
        if (newCsrfToken) {
          originalRequest.headers['_csrf'] = newCsrfToken;

          datadogLogs.logger.info('Updated request with new CSRF token', {
            url: originalRequest.url,
            newTokenPrefix: newCsrfToken.substring(0, 10) + '...',
            timestamp: new Date().toISOString(),
          });
        } else {
          datadogLogs.logger.error(
            'No CSRF token found in cookies after refresh',
            {
              url: originalRequest.url,
              timestamp: new Date().toISOString(),
            }
          );
        }

        return api(originalRequest);
      } catch (csrfRefreshError) {
        datadogLogs.logger.error('CSRF token refresh failed', {
          error: csrfRefreshError,
          timestamp: new Date().toISOString(),
        });
        showToast('Unable to refresh session. Please try again.', 'error');
        return Promise.reject(csrfRefreshError);
      }
    }

    if (error.response?.status === 401) {
      const originalRequest = error.config;

      // Prevent infinite refresh loops
      if (
        originalRequest._retry ||
        originalRequest.url?.includes('/user/auth/refresh')
      ) {
        await handleLogout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await api.post('/user/auth/refresh');

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        datadogLogs.logger.error('Token refresh failed', {
          error: refreshError,
          timestamp: new Date().toISOString(),
        });

        await handleLogout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const endpoint = error.config?.url;
    if (!endpoint) {
      showToast(i18n.t('errors.other.unexpectedErrorOccurred'), 'error');
      return Promise.reject(error);
    }

    if (error.response) {
      const errorCode = error.response.data?.code;
      const errorMessage = errorCode
        ? getTranslatedError(errorCode)
        : 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
    } else if (error.request) {
      showToast(i18n.t('errors.other.noResponseFromServer'), 'error');
    } else {
      showToast(i18n.t('errors.other.unexpectedErrorOccurred'), 'error');
    }

    return Promise.reject(error);
  }
);

export default api;

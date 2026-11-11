import axios from 'axios';
import useAuthStore from '@/config/store/authSlice';
import { getActiveHost, handleNetworkFailure } from '@/config/apiHost';
import i18n from '@/config/i18n';
import { datadogLogs } from '@datadog/browser-logs';
import {
  getApiErrorMessage,
  getFinTabloErrorMessage,
} from '@/services/api/finance/fintablo-errors';
let showToast: (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning'
) => void;

export const setToastFunction = (toastFunction: typeof showToast) => {
  showToast = toastFunction;
};

const handleLogout = async () => {
  try {
    await fetch(`${getActiveHost()}/user/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Server logout failed:', error);
  }

  localStorage.clear();
  sessionStorage.clear();

  const logout = useAuthStore.getState().logout;
  logout();
};

// Without a timeout axios waits until the browser gives up (tens of seconds),
// so an unreachable host could not even be detected. Uploads get longer.
const DEFAULT_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

const api = axios.create({
  baseURL: getActiveHost(),
  withCredentials: true,
  timeout: DEFAULT_TIMEOUT_MS,
});

api.interceptors.request.use(
  config => {
    // Resolved per request so a failover applies to the very next call.
    config.baseURL = getActiveHost();
    if (
      config.data instanceof FormData &&
      config.timeout === DEFAULT_TIMEOUT_MS
    ) {
      config.timeout = UPLOAD_TIMEOUT_MS;
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
    return response;
  },
  async error => {
    if (!error.response && error.config && !axios.isCancel(error)) {
      // No HTTP response at all: the host was unreachable or timed out.
      const failedHost = error.config.baseURL;
      await handleNetworkFailure(failedHost);

      // Retry once on the new host, idempotent methods only: for a POST we
      // cannot know whether the server already processed it.
      const method = (error.config.method || 'get').toLowerCase();
      if (
        getActiveHost() !== failedHost &&
        RETRYABLE_METHODS.has(method) &&
        !error.config._hostRetry
      ) {
        error.config._hostRetry = true;
        return api(error.config);
      }
    }

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
      const finTabloMessage = getFinTabloErrorMessage(error);
      const apiMessage = getApiErrorMessage(error);
      if (finTabloMessage) {
        showToast(finTabloMessage, 'error');
      } else if (apiMessage) {
        showToast(apiMessage, 'error');
      } else {
        const errorCode = error.response.data?.code;
        const errorMessage = errorCode
          ? getTranslatedError(errorCode)
          : 'An error occurred. Please try again.';
        showToast(errorMessage, 'error');
      }
    } else if (error.request) {
      showToast(i18n.t('errors.other.noResponseFromServer'), 'error');
    } else {
      showToast(i18n.t('errors.other.unexpectedErrorOccurred'), 'error');
    }

    return Promise.reject(error);
  }
);

export default api;

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rmb_token') : null;
    if (token) {
      // Use Bearer prefix to match PasswordSessionAuthentication in backend
      config.headers.Authorization = `Bearer ${token}`;
      // Also send as custom header for redundancy
      config.headers['X-Session-Token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the full response.data object. 
    // This allows hooks to access { error, message, data, count }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle Token Expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            originalRequest.headers['X-Session-Token'] = token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      console.warn(`[API] 401 Unauthorized on ${originalRequest.url}. Attempting refresh...`);
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('rmb_refresh') : null;
      
      if (refreshToken && refreshToken !== 'null') {
        try {
          const response = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
            refresh_token: refreshToken,
          });
          
          const token = response.data.data?.token || response.data.token || response.data.session_token;
          const newRefreshToken = response.data.data?.refresh_token || response.data.refresh_token;

          if (token) {
            console.log('[API] Token refreshed successfully');
            localStorage.setItem('rmb_token', token);
            if (newRefreshToken) {
              localStorage.setItem('rmb_refresh', newRefreshToken);
            }
            document.cookie = `rmb_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            
            // Re-attach the NEW token with the correct prefix
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            processQueue(null, token);
            isRefreshing = false;

            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
      }
      
      // If refresh failed or no token, perform clean logout
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.error('[API] Session expired. Redirecting to login.');
        localStorage.removeItem('rmb_token');
        localStorage.removeItem('rmb_refresh');
        document.cookie = 'rmb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      console.error(`[API] 403 Forbidden on ${originalRequest.url}. Check user roles/permissions.`);
    }

    // Extract precise error message from backend
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'An unexpected error occurred';

    const apiError = new Error(message) as Error & {
      code?: string;
      status?: number;
      details?: unknown;
    };
    apiError.code = error.response?.data?.code;
    apiError.status = error.response?.status;
    apiError.details = error.response?.data;

    return Promise.reject(apiError);
  }
);

export const get = <T>(url: string, config = {}): Promise<T> => apiClient.get(url, config);
export const post = <T>(url: string, data = {}, config = {}): Promise<T> => apiClient.post(url, data, config);
export const patch = <T>(url: string, data = {}, config = {}): Promise<T> => apiClient.patch(url, data, config);
export const del = <T>(url: string, config = {}): Promise<T> => apiClient.delete(url, config);

export default apiClient;

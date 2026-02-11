// API configuration for connecting to Go backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  baseUrl: API_BASE_URL,

  // Device endpoints
  devices: {
    list: () => getApiUrl('/api/devices'),
    get: (id: string | number) => getApiUrl(`/api/devices/${id}`),
    create: () => getApiUrl('/api/devices'),
    update: (id: string | number) => getApiUrl(`/api/devices/${id}`),
    delete: (id: string | number) => getApiUrl(`/api/devices/${id}`),
  },

  // Temperature logs
  tempLogs: {
    list: (params?: { startDate?: string; endDate?: string; limit?: number }) => {
      let path = '/api/temp-logs';
      const queryParams: string[] = [];
      if (params?.startDate) queryParams.push(`startDate=${params.startDate}`);
      if (params?.endDate) queryParams.push(`endDate=${params.endDate}`);
      if (params?.limit) queryParams.push(`limit=${params.limit}`);
      if (queryParams.length > 0) path += `?${queryParams.join('&')}`;
      return getApiUrl(path);
    },
    report: (params: { startDate: string; endDate: string; devices?: string }) => {
      let path = '/api/reports/templog';
      const queryParams = [`startDate=${params.startDate}`, `endDate=${params.endDate}`];
      if (params.devices) queryParams.push(`devices=${params.devices}`);
      path += `?${queryParams.join('&')}`;
      return getApiUrl(path);
    },
  },

  // SSE stream
  temperatureStream: () => `${API_BASE_URL}/api/temperature-stream`,

  // Health check
  health: () => getApiUrl('/health'),
};

// Fetch helper with error handling
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export default api;

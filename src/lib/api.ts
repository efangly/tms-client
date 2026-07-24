// API configuration for connecting to Go backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  baseUrl: API_BASE_URL,

  // Device endpoints
  devices: {
    list: () => getApiUrl('/api/devices'),
    get: (ip: string, probeNo?: number | string) => {
      const url = getApiUrl(`/api/devices/${ip}`);
      return probeNo !== undefined ? `${url}?probeNo=${probeNo}` : url;
    },
    create: () => getApiUrl('/api/devices'),
    update: (ip: string, probeNo?: number | string) => {
      const url = getApiUrl(`/api/devices/${ip}`);
      return probeNo !== undefined ? `${url}?probeNo=${probeNo}` : url;
    },
    delete: (id: string | number) => getApiUrl(`/api/devices/${id}`),
  },

  // Schedule report endpoints
  machines: {
    schedule: (ip: string, probeNo: number | string) =>
      getApiUrl(`/api/machines/${ip}/${probeNo}/schedule`),
    scheduleTime: (ip: string, probeNo: number | string, time: string) =>
      getApiUrl(`/api/machines/${ip}/${probeNo}/schedule/${time}`),
  },

  // Temperature logs
  tempLogs: {
    list: (params?: { startDate?: string; endDate?: string; limit?: number; includeArchive?: boolean }) => {
      let path = '/api/temp-logs';
      const queryParams: string[] = [];
      if (params?.startDate) queryParams.push(`startDate=${params.startDate}`);
      if (params?.endDate) queryParams.push(`endDate=${params.endDate}`);
      if (params?.limit) queryParams.push(`limit=${params.limit}`);
      if (params?.includeArchive) queryParams.push('includeArchive=true');
      if (queryParams.length > 0) path += `?${queryParams.join('&')}`;
      return getApiUrl(path);
    },
    report: (params: { startDate: string; endDate: string; devices?: string; includeArchive?: boolean }) => {
      let path = '/api/reports/templog';
      const queryParams = [
        `startDate=${encodeURIComponent(params.startDate)}`,
        `endDate=${encodeURIComponent(params.endDate)}`,
      ];
      if (params.devices) queryParams.push(`devices=${encodeURIComponent(params.devices)}`);
      if (params.includeArchive) queryParams.push('includeArchive=true');
      path += `?${queryParams.join('&')}`;
      return getApiUrl(path);
    },
  },

  // Archive management
  archive: {
    run: () => getApiUrl('/api/archive/run'),
    list: (params: { startDate: string; endDate: string }) =>
      getApiUrl(
        `/api/archive?startDate=${encodeURIComponent(params.startDate)}&endDate=${encodeURIComponent(params.endDate)}`
      ),
    restore: (params: { startDate: string; endDate: string }) =>
      getApiUrl(
        `/api/archive/restore?startDate=${encodeURIComponent(params.startDate)}&endDate=${encodeURIComponent(params.endDate)}`
      ),
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

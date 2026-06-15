import { useState } from 'react';
import DeviceCard from '../components/DeviceCard';
import DeviceEditModal from '../components/DeviceEditModal';
import { useDeviceSSE } from '../hooks/useDeviceSSE';
import type { DeviceData } from '../types/device';

export default function DashboardPage() {
  const { devices, isConnected, error, reconnect } = useDeviceSSE();
  const [editingDevice, setEditingDevice] = useState<DeviceData | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Device Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time temperature monitoring for IoT devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {devices.length} device{devices.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
          <button
            onClick={reconnect}
            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Device Cards grouped by IP */}
      {devices.length > 0 ? (
        <div className="space-y-8">
          {Array.from(
            devices.reduce((map, d) => {
              const ip = d.ipAddress ?? 'Unknown';
              if (!map.has(ip)) map.set(ip, []);
              map.get(ip)!.push(d);
              return map;
            }, new Map<string, typeof devices>())
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ip, group]) => (
              <div key={ip}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-300">{ip}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{group.length} probe{group.length !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group
                    .sort((a, b) => a.machineName.localeCompare(b.machineName))
                    .map((device) => (
                      <DeviceCard
                        key={`${device.ipAddress}-${device.probeNo}`}
                        device={device}
                        onEdit={setEditingDevice}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <p className="text-lg font-medium">Waiting for device data...</p>
          <p className="text-sm mt-1">Connecting to SSE stream</p>
        </div>
      )}

      <DeviceEditModal
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
        onSaved={() => setEditingDevice(null)}
      />
    </main>
  );
}

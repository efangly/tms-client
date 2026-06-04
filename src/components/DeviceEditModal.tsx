import { useEffect, useRef, useState } from 'react';
import { api, fetchApi } from '../lib/api';
import type { DeviceData, DeviceDetail } from '../types/device';

interface DeviceEditModalProps {
  device: DeviceData | null;
  onClose: () => void;
  onSaved: (updated: DeviceData) => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export default function DeviceEditModal({ device, onClose, onSaved }: DeviceEditModalProps) {
  const [machineName, setMachineName] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!device) return;

    setMachineName(device.machineName);
    setMinTemp('');
    setMaxTemp('');
    setIp(device.ipAddress ?? '');
    setError(null);

    if (!device.ipAddress) {
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    setLoading(true);
    fetchApi<DeviceDetail>(api.devices.get(device.ipAddress, device.probeNo))
      .then((detail) => {
        setMachineName(detail.machineName ?? device.machineName);
        setIp(detail.ip);
        setMinTemp(String(detail.minTemp));
        setMaxTemp(String(detail.maxTemp));
        setTimeout(() => inputRef.current?.focus(), 50);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load device details');
      })
      .finally(() => setLoading(false));
  }, [device]);

  if (!device) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = machineName.trim();
    if (!name) return;

    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { machineName: name };
      if (minTemp !== '') body.minTemp = parseFloat(minTemp);
      if (maxTemp !== '') body.maxTemp = parseFloat(maxTemp);

      const updated = await fetchApi<DeviceData>(api.devices.update(ip, device!.probeNo), {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.172-8.172z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Device</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Loading skeleton */}
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            ) : (
              <>
                {/* IP — read-only */}
                {ip && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">IP Address</p>
                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                      {ip}
                    </p>
                  </div>
                )}

                {/* Machine Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Machine Name
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="Enter machine name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Min / Max Temp */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Min Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={minTemp}
                      onChange={(e) => setMinTemp(e.target.value)}
                      placeholder="e.g. -30"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Max Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={maxTemp}
                      onChange={(e) => setMaxTemp(e.target.value)}
                      placeholder="e.g. 10"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Read-only live data */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Temp</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {device.tempValue.toFixed(2)} °C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {device.status === 'H' ? 'Critical' : device.status === 'L' ? 'Warning' : 'Normal'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || saving || !machineName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

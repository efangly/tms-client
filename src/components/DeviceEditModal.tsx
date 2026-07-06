import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { api, fetchApi } from '../lib/api';
import type { DeviceData, DeviceDetail, ScheduleResponse } from '../types/device';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

interface DeviceEditModalProps {
  device: DeviceData | null;
  onClose: () => void;
  onSaved: (updated: DeviceData) => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

export default function DeviceEditModal({ device, onClose, onSaved }: DeviceEditModalProps) {
  const [machineName, setMachineName] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [adjTemp, setAdjTemp] = useState('');
  const [chkReport, setChkReport] = useState(false);
  const [chkMon, setChkMon] = useState(false);
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [newHour, setNewHour] = useState('08');
  const [newMinute, setNewMinute] = useState('00');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!device) return;

    setMachineName(device.machineName);
    setMinTemp('');
    setMaxTemp('');
    setAdjTemp('');
    setChkReport(false);
    setChkMon(false);
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
        setIp(detail.machineIp ?? device.ipAddress ?? '');
        setMinTemp(String(detail.minTemp));
        setMaxTemp(String(detail.maxTemp));
        setAdjTemp(detail.adjTemp != null ? String(detail.adjTemp) : '');
        setChkReport(detail.chkReport === '1');
        setChkMon(detail.chkMon === '1');
        setTimeout(() => inputRef.current?.focus(), 50);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load device details');
      })
      .finally(() => setLoading(false));
  }, [device]);

  useEffect(() => {
    setNewHour('08');
    setNewMinute('00');
    if (!device?.ipAddress || device.probeNo === undefined) {
      setScheduleTimes([]);
      return;
    }

    setScheduleLoading(true);
    fetchApi<ScheduleResponse>(api.machines.schedule(device.ipAddress, device.probeNo))
      .then((res) => setScheduleTimes(res.times ?? []))
      .catch(() => setScheduleTimes([]))
      .finally(() => setScheduleLoading(false));
  }, [device?.ipAddress, device?.probeNo]);

  if (!device) return null;

  const isHumidity = device.type === 'H';
  const unit = isHumidity ? '%' : '°C';

  async function handleAddSchedule() {
    if (!device?.ipAddress || device.probeNo === undefined) return;
    const time = `${newHour}${newMinute}`;

    setScheduleSaving(true);
    try {
      const res = await fetchApi<ScheduleResponse>(
        api.machines.scheduleTime(device.ipAddress, device.probeNo, time),
        { method: 'POST' }
      );
      setScheduleTimes(res.times ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add schedule time';
      Toast.fire({ icon: 'error', title: msg });
    } finally {
      setScheduleSaving(false);
    }
  }

  async function handleDeleteSchedule(time: string) {
    if (!device?.ipAddress || device.probeNo === undefined) return;

    setScheduleSaving(true);
    try {
      const res = await fetchApi<ScheduleResponse>(
        api.machines.scheduleTime(device.ipAddress, device.probeNo, time),
        { method: 'DELETE' }
      );
      setScheduleTimes(res.times ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove schedule time';
      Toast.fire({ icon: 'error', title: msg });
    } finally {
      setScheduleSaving(false);
    }
  }

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
      if (adjTemp !== '') body.adjTemp = parseFloat(adjTemp);
      if (ip) body.chkReport = chkReport ? '1' : '0';

      const updated = await fetchApi<DeviceData>(api.devices.update(ip, device!.probeNo), {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      onSaved(updated);
      onClose();
      Toast.fire({ icon: 'success', title: 'Device saved successfully' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes';
      setError(msg);
      Toast.fire({ icon: 'error', title: msg });
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
                      Min {isHumidity ? 'Humidity' : 'Temp'} ({unit})
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
                      Max {isHumidity ? 'Humidity' : 'Temp'} ({unit})
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

                {/* Adj Temp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Adj {isHumidity ? 'Humidity' : 'Temp'} ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjTemp}
                    onChange={(e) => setAdjTemp(e.target.value)}
                    placeholder="e.g. 0"
                    className={inputClass}
                  />
                </div>

                {/* Repeat Alert (chkReport / chkMon) */}
                {ip && (
                  <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">แจ้งเตือนต่อเนื่อง</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          ส่ง alert ซ้ำทุกรอบตรวจจนกว่าค่าจะกลับเข้าช่วงปกติ
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={chkReport}
                        aria-label="Toggle repeat alert"
                        onClick={() => setChkReport((v) => !v)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                          chkReport ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            chkReport ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {chkMon && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-400">
                          อยู่ระหว่างแจ้งเตือนต่อเนื่อง จะหยุดอัตโนมัติเมื่อค่ากลับเข้าช่วงปกติ
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Report Times */}
                {ip && (
                  <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Schedule Report Times
                      </label>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{scheduleTimes.length}/6</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {scheduleLoading ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                      ) : scheduleTimes.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500">No schedule set</p>
                      ) : (
                        scheduleTimes.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800"
                          >
                            {t.slice(0, 2)}:{t.slice(2)}
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(t)}
                              disabled={scheduleSaving}
                              aria-label={`Remove ${t}`}
                              className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={newHour}
                        onChange={(e) => setNewHour(e.target.value)}
                        disabled={scheduleSaving || scheduleTimes.length >= 6}
                        className={inputClass}
                      >
                        {HOUR_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newMinute}
                        onChange={(e) => setNewMinute(e.target.value)}
                        disabled={scheduleSaving || scheduleTimes.length >= 6}
                        className={inputClass}
                      >
                        {MINUTE_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSchedule}
                        disabled={scheduleSaving || scheduleTimes.length >= 6}
                        className="shrink-0 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                    {scheduleTimes.length >= 6 && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Maximum 6 schedule times</p>
                    )}
                  </div>
                )}

                {/* Read-only live data */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Current {isHumidity ? 'Humidity' : 'Temp'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {device.tempValue.toFixed(2)} {unit}
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

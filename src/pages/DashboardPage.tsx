import { useEffect, useMemo, useRef, useState } from 'react';
import DeviceCard from '../components/DeviceCard';
import DeviceEditModal from '../components/DeviceEditModal';
import { useDeviceSSE } from '../hooks/useDeviceSSE';
import type { DeviceData } from '../types/device';

const CARD_W = 260;
const CARD_H = 120;
const CARD_GAP = 14;
const GROUP_HEADER_H = 34;
const GROUP_GAP = 12;
const MAX_FIT_DEVICES = 40;

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function computeFitLayout(groupSizes: number[], availW: number, availH: number) {
  const totalDevices = groupSizes.reduce((sum, n) => sum + n, 0);
  const maxCols = Math.max(1, totalDevices);

  let best = { cols: 1, scale: 0, naturalW: CARD_W, naturalH: CARD_H };

  for (let cols = 1; cols <= maxCols; cols++) {
    let naturalH = 0;
    groupSizes.forEach((n, i) => {
      const rows = Math.ceil(n / cols);
      naturalH += GROUP_HEADER_H + rows * CARD_H + (rows - 1) * CARD_GAP;
      if (i < groupSizes.length - 1) naturalH += GROUP_GAP;
    });
    const naturalW = cols * CARD_W + (cols - 1) * CARD_GAP;

    if (naturalW <= 0 || naturalH <= 0) continue;
    const scale = Math.min(availW / naturalW, availH / naturalH);
    if (scale > best.scale) {
      best = { cols, scale, naturalW, naturalH };
    }
  }

  return best;
}

function capGroupSizes(groupSizes: number[], cap: number) {
  const total = groupSizes.reduce((a, b) => a + b, 0);
  if (total <= cap) return groupSizes;
  const ratio = cap / total;
  return groupSizes.map((n) => Math.max(1, Math.round(n * ratio)));
}

export default function DashboardPage() {
  const { devices, isConnected, error, reconnect } = useDeviceSSE();
  const [editingDevice, setEditingDevice] = useState<DeviceData | null>(null);
  const { ref: fitRef, size: fitSize } = useElementSize<HTMLDivElement>();

  const groups = useMemo(() => {
    const map = devices.reduce((m, d) => {
      const ip = d.ipAddress ?? 'Unknown';
      if (!m.has(ip)) m.set(ip, []);
      m.get(ip)!.push(d);
      return m;
    }, new Map<string, typeof devices>());

    return Array.from(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ip, group]) => ({
        ip,
        devices: [...group].sort((a, b) => a.machineName.localeCompare(b.machineName)),
      }));
  }, [devices]);

  const totalDevices = useMemo(
    () => groups.reduce((sum, g) => sum + g.devices.length, 0),
    [groups]
  );
  const isOverCap = totalDevices > MAX_FIT_DEVICES;

  const layout = useMemo(
    () =>
      computeFitLayout(
        capGroupSizes(groups.map((g) => g.devices.length), MAX_FIT_DEVICES),
        fitSize.width,
        fitSize.height
      ),
    [groups, fitSize.width, fitSize.height]
  );

  return (
    <main className="h-full flex flex-col px-4 sm:px-6 lg:px-8 py-2 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-end mb-2">
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
        <div className="shrink-0 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
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

      {/* Device Cards grouped by IP, sized to fit available space */}
      <div
        ref={fitRef}
        className={`flex-1 min-h-0 flex justify-center ${
          isOverCap ? 'items-start overflow-y-auto' : 'items-center overflow-hidden'
        }`}
      >
        {devices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: layout.scale * GROUP_GAP }}>
            {groups.map(({ ip, devices: group }) => (
              <div key={ip}>
                <div
                  className="flex items-center mb-2"
                  style={{ height: layout.scale * (GROUP_HEADER_H - 8), gap: layout.scale * 8 }}
                >
                  <div
                    className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600"
                    style={{ gap: layout.scale * 7, padding: `${layout.scale * 5}px ${layout.scale * 10}px` }}
                  >
                    <svg style={{ width: layout.scale * 15, height: layout.scale * 15 }} className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span
                      className="font-mono font-bold text-gray-700 dark:text-gray-200"
                      style={{ fontSize: layout.scale * 12 }}
                    >
                      {ip}
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: layout.scale * 12 }}>
                    {group.length} probe{group.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${layout.cols}, ${layout.scale * CARD_W}px)`,
                    gap: layout.scale * CARD_GAP,
                  }}
                >
                  {group.map((device) => (
                    <div
                      key={`${device.ipAddress}-${device.probeNo}`}
                      style={{ width: layout.scale * CARD_W, height: layout.scale * CARD_H }}
                    >
                      <DeviceCard device={device} onEdit={setEditingDevice} scale={layout.scale} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
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
      </div>

      <DeviceEditModal
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
        onSaved={() => setEditingDevice(null)}
      />
    </main>
  );
}

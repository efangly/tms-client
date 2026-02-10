interface Device {
  id: string;
  ip: string;
  devicename: string;
  probe: number;
}

interface DeviceSelectorProps {
  devices: Device[];
  selectedDevices: Set<string>;
  onToggleDevice: (deviceId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  isLoading?: boolean;
  variant?: 'card' | 'table';
}

export default function DeviceSelector({
  devices,
  selectedDevices,
  onToggleDevice,
  onToggleAll,
  allSelected,
  isLoading = false,
  variant = 'card',
}: DeviceSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
        ไม่พบอุปกรณ์
      </p>
    );
  }

  // Table variant (for chart page)
  if (variant === 'table') {
    return (
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">IP</th>
              <th className="px-2 py-2 text-center text-gray-600 dark:text-gray-300">No.</th>
              <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">ชื่อเครื่อง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {devices.map((device) => (
              <tr
                key={device.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onToggleDevice(device.id)}
              >
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedDevices.has(device.id)}
                    onChange={() => onToggleDevice(device.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{device.ip}</td>
                <td className="px-2 py-2 text-center text-gray-700 dark:text-gray-300">{device.probe}</td>
                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{device.devicename}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Card variant (for report page)
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {devices.map((device) => (
        <label
          key={device.id}
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
            selectedDevices.has(device.id)
              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
              : 'bg-gray-50 dark:bg-gray-700 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <input
            type="checkbox"
            checked={selectedDevices.has(device.id)}
            onChange={() => onToggleDevice(device.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {device.devicename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {device.ip} • Probe {device.probe}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}

import type { DeviceData } from '../types/device';

interface DeviceCardProps {
  device: DeviceData;
}

function getStatusFromTemp(temp: number) {
  if (temp >= 50) {
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      ring: 'ring-red-500/30',
      dot: 'bg-red-500',
      label: 'Critical',
    };
  }
  if (temp >= 40) {
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      ring: 'ring-yellow-500/30',
      dot: 'bg-yellow-500',
      label: 'Warning',
    };
  }
  return {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    ring: 'ring-green-500/30',
    dot: 'bg-green-500',
    label: 'Normal',
  };
}

function getTempColor(temp: number) {
  if (temp >= 50) return 'text-red-600 dark:text-red-400';
  if (temp >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const statusStyle = getStatusFromTemp(device.tempValue);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{device.machineName}</h3>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
          {statusStyle.label}
        </span>
      </div>

      {/* Temperature */}
      <div className="text-center py-4">
        <div className={`text-4xl font-bold ${getTempColor(device.tempValue)} transition-colors duration-300`}>
          {device.tempValue.toFixed(2)}
          <span className="text-lg ml-1">°C</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {device.timestamp}
        </div>
      </div>
    </div>
  );
}

import type { DeviceData } from '../types/device';

interface DeviceCardProps {
  device: DeviceData;
  onEdit?: (device: DeviceData) => void;
}

function getStatusFromTemp(temp: string) {
  if (temp === 'H') {
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      ring: 'ring-red-500/30',
      dot: 'bg-red-500',
      label: 'Critical',
    };
  }
  if (temp === 'L') {
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

function getTempColor(temp: string) {
  if (temp === 'H') return 'text-red-600 dark:text-red-400';
  if (temp === 'L') return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export default function DeviceCard({ device, onEdit }: DeviceCardProps) {
  const statusStyle = getStatusFromTemp(device.status);
  const isHumidity = device.type === 'H';
  const isThermometer = device.type === 'T';

  return (
    <div className={`${isHumidity ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700' : isThermometer ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} rounded-xl shadow-md hover:shadow-lg border p-5 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${isHumidity ? 'bg-sky-100 dark:bg-sky-800/40' : isThermometer ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center`}>
            {isHumidity ? (
              <svg className="w-5 h-5 text-sky-500 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z" />
              </svg>
            ) : isThermometer ? (
              <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9a3 3 0 1 1 6 0v5.586l1.707 1.707A1 1 0 0 1 16 18H8a1 1 0 0 1-.707-1.707L9 14.586V9z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{device.machineName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
            {statusStyle.label}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(device)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors duration-200"
              title="Edit device"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.172-8.172z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Value display */}
      <div className="text-center py-4">
        {isHumidity ? (
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z" />
            </svg>
            <div className={`text-4xl font-bold text-sky-500 dark:text-sky-400 transition-colors duration-300`}>
              {device.tempValue.toFixed(2)}
              <span className="text-lg ml-1">%</span>
            </div>
          </div>
        ) : isThermometer ? (
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9a3 3 0 1 1 6 0v5.586l1.707 1.707A1 1 0 0 1 16 18H8a1 1 0 0 1-.707-1.707L9 14.586V9z" />
            </svg>
            <div className={`text-4xl font-bold ${getTempColor(device.status)} transition-colors duration-300`}>
              {device.tempValue.toFixed(2)}
              <span className="text-lg ml-1">°C</span>
            </div>
          </div>
        ) : (
          <div className={`text-4xl font-bold ${getTempColor(device.status)} transition-colors duration-300`}>
            {device.tempValue.toFixed(2)}
            <span className="text-lg ml-1">°C</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-center pt-3 border-t ${isHumidity ? 'border-sky-100 dark:border-sky-800' : isThermometer ? 'border-orange-100 dark:border-orange-800' : 'border-gray-100 dark:border-gray-700'}`}>
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

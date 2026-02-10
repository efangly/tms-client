import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import DeviceSelector from '../components/DeviceSelector';
import { useTempLogData } from '../hooks/useTempLogData';
import { FiTrendingUp, FiPrinter, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Color palette for chart lines
const colors = [
  { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.5)' },
  { border: 'rgb(75, 192, 92)', background: 'rgba(75, 192, 92, 0.5)' },
  { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.5)' },
  { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.5)' },
  { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.5)' },
  { border: 'rgb(255, 205, 86)', background: 'rgba(255, 205, 86, 0.5)' },
  { border: 'rgb(201, 203, 207)', background: 'rgba(201, 203, 207, 0.5)' },
  { border: 'rgb(0, 128, 128)', background: 'rgba(0, 128, 128, 0.5)' },
  { border: 'rgb(128, 0, 128)', background: 'rgba(128, 0, 128, 0.5)' },
  { border: 'rgb(0, 0, 139)', background: 'rgba(0, 0, 139, 0.5)' },
];

export default function ChartPage() {
  const navigate = useNavigate();
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    devices,
    selectedDevices,
    toggleDevice,
    toggleAllDevices,
    allSelected,
    isLoadingDevices,
    series,
    isLoading,
    error,
    fetchData,
  } = useTempLogData();

  // Chart.js data configuration
  const chartData = {
    datasets: series.map((s, index) => ({
      label: s.label,
      data: s.data,
      borderColor: colors[index % colors.length].border,
      backgroundColor: colors[index % colors.length].background,
      tension: 0.1,
      pointRadius: 2,
      borderWidth: 2,
    })),
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'กราฟแสดงอุณหภูมิตู้แช่',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'dd/MM HH:mm',
            day: 'dd/MM/yyyy',
          },
        },
        title: {
          display: true,
          text: 'Date Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Device Selection */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              เลือกตู้แช่
            </h2>

            {/* Device List */}
            <div className="mb-4">
              <DeviceSelector
                devices={devices}
                selectedDevices={selectedDevices}
                onToggleDevice={toggleDevice}
                onToggleAll={toggleAllDevices}
                allSelected={allSelected}
                isLoading={isLoadingDevices}
                variant="table"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  เริ่มตั้งแต่
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  ถึง
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Show Data Button */}
            <button
              onClick={fetchData}
              disabled={isLoading || selectedDevices.size === 0}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'กำลังโหลด...' : 'แสดงข้อมูล'}
            </button>

            {error && (
              <p className="mt-2 text-red-500 dark:text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>

        {/* Right Panel - Chart */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div style={{ height: '500px' }}>
              {series.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <FiTrendingUp className="text-6xl mb-4 mx-auto" />
                    <p>เลือกเครื่องและช่วงเวลา แล้วกดปุ่ม &quot;แสดงข้อมูล&quot;</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {series.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <FiPrinter /> พิมพ์กราฟ
                </button>
                <button
                  onClick={() => navigate('/report')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <FiFileText /> พิมพ์รายงาน
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

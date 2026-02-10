import { useState, lazy, Suspense } from 'react';
import DeviceSelector from '../components/DeviceSelector';
import TempLogReport from '../components/TempLogReport';
import { useTempLogData } from '../hooks/useTempLogData';
import { FiSearch, FiDownload } from 'react-icons/fi';

// Lazy load PDF components to avoid SSR/build issues
const PDFDownloadLink = lazy(() =>
  import('@react-pdf/renderer').then((mod) => ({ default: mod.PDFDownloadLink }))
);

const PDFViewer = lazy(() =>
  import('@react-pdf/renderer').then((mod) => ({ default: mod.PDFViewer }))
);

export default function ReportPage() {
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
    data,
    isLoading,
    error,
    fetchData,
  } = useTempLogData();

  const [showPreview, setShowPreview] = useState(false);

  const handleFetchReport = async () => {
    const success = await fetchData();
    setShowPreview(!!success);
  };

  const formatFileName = () => {
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    return `TempLog_Report_${start}_${end}.pdf`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Panel - Device Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                เลือกอุปกรณ์
              </h2>
              <button
                onClick={toggleAllDevices}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </div>

            <DeviceSelector
              devices={devices}
              selectedDevices={selectedDevices}
              onToggleDevice={toggleDevice}
              onToggleAll={toggleAllDevices}
              allSelected={allSelected}
              isLoading={isLoadingDevices}
              variant="card"
            />

            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                เลือก {selectedDevices.size} / {devices.length} อุปกรณ์
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Filter and Report */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
              เลือกช่วงเวลา
            </h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleFetchReport}
                disabled={isLoading || !startDate || !endDate || selectedDevices.size === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  'กำลังโหลด...'
                ) : (
                  <>
                    <FiSearch /> ดูรายงาน
                  </>
                )}
              </button>

              {showPreview && (
                <Suspense
                  fallback={
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                    >
                      กำลังโหลด...
                    </button>
                  }
                >
                  <PDFDownloadLink
                    document={
                      <TempLogReport
                        data={data}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    }
                    fileName={formatFileName()}
                  >
                    {({ loading }: { loading: boolean }) => (
                      <button
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          'กำลังสร้าง PDF...'
                        ) : (
                          <>
                            <FiDownload /> ดาวน์โหลด PDF
                          </>
                        )}
                      </button>
                    )}
                  </PDFDownloadLink>
                </Suspense>
              )}
            </div>

            {error && (
              <p className="mt-3 text-red-500 dark:text-red-400 text-sm">{error}</p>
            )}

            {showPreview && (
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                พบข้อมูล {data.length} รายการ
              </p>
            )}
          </div>

          {/* PDF Preview */}
          {showPreview && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  ตัวอย่างรายงาน
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {data.length === 0 ? 'ไม่พบข้อมูล' : `${data.length} รายการ`}
                </span>
              </div>
              <div
                className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
                style={{ height: '800px' }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                      <p className="text-gray-500">กำลังโหลด PDF Viewer...</p>
                    </div>
                  }
                >
                  <PDFViewer width="100%" height="100%" showToolbar={true}>
                    <TempLogReport
                      data={data}
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </PDFViewer>
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

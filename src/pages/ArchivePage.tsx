import Swal from 'sweetalert2';
import { FiArchive, FiSearch, FiDownloadCloud } from 'react-icons/fi';
import { useArchive } from '../hooks/useArchive';
import { formatDate, formatDateTime } from '../lib/date-format';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function ArchivePage() {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    manifests,
    isRunning,
    isListing,
    isRestoring,
    error,
    runArchive,
    fetchManifests,
    restoreArchive,
  } = useArchive();

  async function handleRunArchive() {
    const confirm = await Swal.fire({
      title: 'ยืนยันการจัดเก็บถาวร',
      text: 'ระบบจะย้ายข้อมูลเก่าออกจากตารางหลักไปยังที่จัดเก็บถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });
    if (!confirm.isConfirmed) return;

    const result = await runArchive();
    if (result) {
      Toast.fire({
        icon: 'success',
        title: `จัดเก็บถาวรสำเร็จ: ${result.daysArchived} วัน, ${result.rowsArchived} แถว`,
      });
    } else {
      Toast.fire({ icon: 'error', title: 'จัดเก็บถาวรไม่สำเร็จ' });
    }
  }

  async function handleRestore() {
    const confirm = await Swal.fire({
      title: 'ยืนยันการกู้คืนข้อมูล',
      text: 'ระบบจะกู้คืนข้อมูลจากที่จัดเก็บถาวรกลับมายังตารางหลักสำหรับช่วงวันที่ที่เลือก',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });
    if (!confirm.isConfirmed) return;

    const result = await restoreArchive();
    if (result) {
      Toast.fire({
        icon: 'success',
        title: `กู้คืนสำเร็จ: ${result.daysRestored} วัน, ${result.rowsRestored} แถว`,
      });
    } else {
      Toast.fire({ icon: 'error', title: 'กู้คืนข้อมูลไม่สำเร็จ' });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FiArchive className="text-2xl text-gray-500 dark:text-gray-400" />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            จัดการข้อมูลถาวร
          </h1>
        </div>

        {/* Date range */}
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
            onClick={fetchManifests}
            disabled={isListing || !startDate || !endDate}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSearch /> {isListing ? 'กำลังโหลด...' : 'ดูรายการที่จัดเก็บ'}
          </button>

          <button
            onClick={handleRestore}
            disabled={isRestoring || !startDate || !endDate}
            className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownloadCloud /> {isRestoring ? 'กำลังกู้คืน...' : 'กู้คืนข้อมูล'}
          </button>
        </div>

        {/* Run archive */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                จัดเก็บข้อมูลเก่าถาวรทันที
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                ย้ายข้อมูลที่เก่ากว่ารอบเก็บข้อมูลออกจากตารางหลัก
              </p>
            </div>
            <button
              onClick={handleRunArchive}
              disabled={isRunning}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <FiArchive /> {isRunning ? 'กำลังจัดเก็บ...' : 'Run Archive Now'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        )}

        {/* Manifests table */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            รายการที่จัดเก็บถาวร {manifests.length > 0 && `(${manifests.length})`}
          </h2>
          {manifests.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</p>
          ) : (
            <div className="border dark:border-gray-700 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">วันที่</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">ตาราง</th>
                    <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">จำนวนแถว</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">ไฟล์</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">จัดเก็บเมื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {manifests.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {formatDate(m.periodDate)}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{m.sourceTable}</td>
                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                        {m.rowCount}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs truncate max-w-xs">
                        {m.filePath}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                        {formatDateTime(m.archivedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

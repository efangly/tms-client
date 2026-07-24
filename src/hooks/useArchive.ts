import { useCallback, useState } from 'react';
import { api, fetchApi } from '../lib/api';

export interface ArchiveManifest {
  id: string | number;
  sourceTable: string;
  periodDate: string;
  filePath: string;
  rowCount: number;
  archivedAt: string;
}

interface RunArchiveResult {
  daysArchived: number;
  rowsArchived: number;
}

interface RestoreArchiveResult {
  daysRestored: number;
  rowsRestored: number;
}

export function useArchive() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manifests, setManifests] = useState<ArchiveManifest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runArchive = useCallback(async (): Promise<RunArchiveResult | null> => {
    setIsRunning(true);
    setError(null);
    try {
      return await fetchApi<RunArchiveResult>(api.archive.run(), { method: 'POST' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run archive');
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const fetchManifests = useCallback(async (): Promise<boolean> => {
    if (!startDate || !endDate) {
      setError('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return false;
    }

    setIsListing(true);
    setError(null);
    try {
      const result = await fetchApi<ArchiveManifest[]>(api.archive.list({ startDate, endDate }));
      setManifests(result ?? []);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list archives');
      return false;
    } finally {
      setIsListing(false);
    }
  }, [startDate, endDate]);

  const restoreArchive = useCallback(async (): Promise<RestoreArchiveResult | null> => {
    if (!startDate || !endDate) {
      setError('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return null;
    }

    setIsRestoring(true);
    setError(null);
    try {
      return await fetchApi<RestoreArchiveResult>(api.archive.restore({ startDate, endDate }), {
        method: 'POST',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore archive');
      return null;
    } finally {
      setIsRestoring(false);
    }
  }, [startDate, endDate]);

  return {
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
  };
}

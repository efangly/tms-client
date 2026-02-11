import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

export interface Device {
  id: string;
  machineIp: string;
  machineName: string;
  probeNo: number;
  mcuId: string;
}

export interface TempLogItem {
  machineIp: string;
  probeNo: number;
  machineName: string;
  tempValue: number;
  insertTime: string;
  mcuId: string;
}

export interface ChartSeries {
  label: string;
  data: { x: string; y: number }[];
}

export function useTempLogData() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [data, setData] = useState<TempLogItem[]>([]);
  const [series, setSeries] = useState<ChartSeries[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(api.devices.list());
        if (response.ok) {
          const result = await response.json();
          const deviceList = Array.isArray(result) ? result : (result.data || result.devices || []);
          setDevices(deviceList);
          // Select all devices by default
          setSelectedDevices(new Set(deviceList.map((d: Device) => String(d.machineName))));
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
      } finally {
        setIsLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  // Toggle single device selection
  const toggleDevice = useCallback((deviceId: string) => {
    setSelectedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  }, []);

  // Toggle all devices
  const toggleAllDevices = useCallback(() => {
    if (selectedDevices.size === devices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(devices.map((d) => String(d.machineName))));
    }
  }, [selectedDevices.size, devices]);

  // Check if all devices are selected
  const allSelected = devices.length > 0 && selectedDevices.size === devices.length;

  // Fetch temp log data
  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return false;
    }

    if (selectedDevices.size === 0) {
      setError('กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const deviceIds = Array.from(selectedDevices).join(',');
      const response = await fetch(
        api.tempLogs.report({ startDate, endDate, devices: deviceIds })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result.data || []);
      setSeries(result.series || []);
      return true;
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error fetching data:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedDevices]);

  // Clear data
  const clearData = useCallback(() => {
    setData([]);
    setSeries([]);
    setError(null);
  }, []);

  return {
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
    series,
    isLoading,
    error,
    fetchData,
    clearData,
  };
}

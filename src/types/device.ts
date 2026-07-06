export interface DeviceData {
  machineName: string;
  status: string;
  tempValue: number;
  timestamp: string;
  ipAddress?: string;
  probeNo?: number | string;
  type?: string;
  adjTemp?: number;
}

export interface DeviceDetail {
  machineName: string;
  machineIp: string;
  probeNo?: number | string;
  minTemp: number;
  maxTemp: number;
  adjTemp?: number;
  chkReport?: string;
  chkMon?: string;
}

export interface ScheduleResponse {
  times: string[] | null;
}
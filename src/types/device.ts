export interface DeviceData {
  machineName: string;
  status: string;
  tempValue: number;
  timestamp: string;
  ipAddress?: string;
  probeNo?: number | string;
  type?: string;
}

export interface DeviceDetail {
  machineName: string;
  machineIp: string;
  probeNo?: number | string;
  minTemp: number;
  maxTemp: number;
}
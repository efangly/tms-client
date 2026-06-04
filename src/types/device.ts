export interface DeviceData {
  machineName: string;
  status: string;
  tempValue: number;
  timestamp: string;
  ipAddress?: string;
  probeNo?: number | string;
}

export interface DeviceDetail {
  machineName: string;
  ip: string;
  probeNo?: number | string;
  minTemp: number;
  maxTemp: number;
}
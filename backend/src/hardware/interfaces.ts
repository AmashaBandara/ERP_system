/** Pluggable hardware abstractions. Real device drivers are implemented later;
 *  this module defines the contracts and provides mock providers for dev/test. */

export interface PrintPayload {
  lines: Array<{ text: string; bold?: boolean; size?: 'normal' | 'large'; align?: 'left' | 'center' | 'right' }>;
  copies?: number;
}

export interface PrinterProvider {
  readonly name: string;
  print(payload: PrintPayload): Promise<{ ok: boolean; jobId: string }>;
  test(): Promise<{ ok: boolean }>;
}

export interface AttendanceRecord {
  employeeDeviceId: string;
  timestamp: Date;
  direction: 'IN' | 'OUT';
  method: 'FINGERPRINT' | 'FACE';
}

export interface AttendanceProvider {
  readonly name: string;
  syncRecent(since?: Date): Promise<AttendanceRecord[]>;
  enroll(employeeDeviceId: string, name: string): Promise<{ ok: boolean }>;
  test(): Promise<{ ok: boolean }>;
}

export interface HardwareRegistry {
  printers: Map<string, PrinterProvider>;
  attendance: Map<string, AttendanceProvider>;
  getPrinter(name?: string): PrinterProvider | undefined;
  getAttendance(name?: string): AttendanceProvider | undefined;
}

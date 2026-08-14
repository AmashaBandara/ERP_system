import crypto from 'node:crypto';
import type { AttendanceProvider, AttendanceRecord, HardwareRegistry, PrinterProvider, PrintPayload } from '../interfaces';

export class MockPrinter implements PrinterProvider {
  readonly name = 'mock:escpos';
  async print(payload: PrintPayload): Promise<{ ok: boolean; jobId: string }> {
    const jobId = crypto.randomUUID();
    console.log(`[hardware:printer] (mock) job=${jobId} lines=${payload.lines.length} copies=${payload.copies ?? 1}`);
    return { ok: true, jobId };
  }
  async test() {
    return { ok: true };
  }
}

export class MockAttendance implements AttendanceProvider {
  readonly name = 'mock:attendance';
  async syncRecent(): Promise<AttendanceRecord[]> {
    return [
      {
        employeeDeviceId: 'DEV-ERRET-001',
        timestamp: new Date(),
        direction: 'IN',
        method: 'FINGERPRINT',
      },
    ];
  }
  async enroll(employeeDeviceId: string, name: string) {
    console.log(`[hardware:mock] enroll ${name} (${employeeDeviceId})`);
    return { ok: true };
  }
  async test() {
    return { ok: true };
  }
}

export function buildHardwareRegistry(): HardwareRegistry {
  const printers = new Map<string, PrinterProvider>();
  const attendance = new Map<string, AttendanceProvider>();
  const mockPrinter = new MockPrinter();
  const mockAttendance = new MockAttendance();
  printers.set(mockPrinter.name, mockPrinter);
  attendance.set(mockAttendance.name, mockAttendance);

  return {
    printers,
    attendance,
    getPrinter: (name?: string) => (name ? printers.get(name) : printers.values().next().value as PrinterProvider | undefined),
    getAttendance: (name?: string) => (name ? attendance.get(name) : attendance.values().next().value as AttendanceProvider | undefined),
  };
}
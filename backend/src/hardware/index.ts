import type { HardwareRegistry } from './interfaces';
import { buildHardwareRegistry } from './adapters/mock';

export const hardware: HardwareRegistry = buildHardwareRegistry();
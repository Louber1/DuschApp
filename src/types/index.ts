export type Phase = 'setup' | 'hot' | 'cold';

export interface ShowerConfig {
  totalDuration: number; // in minutes
  hotDuration: number; // in seconds
  coldDuration: number; // in seconds
  totalCycles: number;
}

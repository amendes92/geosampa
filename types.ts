export enum JobStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  RETRYING = 'RETRYING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LayerConfig {
  id: string;
  name: string;
  wfsUrl: string;
  targetCrs: string;
  estimatedCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface IngestionJob {
  id: string;
  layer: LayerConfig;
  status: JobStatus;
  processedCount: number;
  totalCount: number;
  currentBatch: number;
  currentSpeed: number; // features per second
  errors: number;
  startTime?: number;
}

export interface GeminiAnalysis {
  layerName: string;
  summary: string;
  optimizationTips: string[];
}

export interface ErrorDiagnosis {
  layerName: string;
  errorType: string;
  explanation: string;
  suggestedFix: string;
}

export type ModalMode = 'OPTIMIZATION' | 'DIAGNOSIS' | 'SQL';
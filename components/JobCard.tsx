import React from 'react';
import { IngestionJob, JobStatus } from '../types';
import { Play, Pause, AlertTriangle, Activity, Database, Server, Bug } from 'lucide-react';

interface JobCardProps {
  job: IngestionJob;
  onToggle: (id: string) => void;
  onAnalyze: (job: IngestionJob, mode: 'OPTIMIZATION' | 'DIAGNOSIS') => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onToggle, onAnalyze }) => {
  const progress = Math.min(100, (job.processedCount / job.totalCount) * 100);
  
  return (
    <div className={`bg-slate-900 border rounded-lg p-6 transition-all duration-300 ${
      job.status === JobStatus.ERROR ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
      job.status === JobStatus.RETRYING ? 'border-yellow-500/30' :
      'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database size={18} className="text-indigo-400" />
            {job.layer.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">{job.layer.wfsUrl}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${
          job.status === JobStatus.RUNNING ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
          job.status === JobStatus.RETRYING ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
          job.status === JobStatus.ERROR ? 'bg-red-500/10 border-red-500/30 text-red-500' :
          job.status === JobStatus.COMPLETED ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {job.status === JobStatus.RETRYING && <AlertTriangle size={10} />}
          {job.status}
        </div>
      </div>

      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-950 p-3 rounded border border-slate-800/50">
            <span className="text-slate-500 block text-xs mb-1">PROCESSED</span>
            <span className="text-white font-mono">{job.processedCount.toLocaleString()}</span>
          </div>
           <div className="bg-slate-950 p-3 rounded border border-slate-800/50">
            <span className="text-slate-500 block text-xs mb-1">SPEED</span>
            <span className={`font-mono flex items-center gap-1 ${job.status === JobStatus.RUNNING ? 'text-green-400' : 'text-slate-500'}`}>
              <Activity size={12} />
              {job.status === JobStatus.RUNNING ? job.currentSpeed.toLocaleString() : 0} <span className="text-[10px] text-slate-600">/sec</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                job.status === JobStatus.RETRYING ? 'bg-yellow-500' : 
                job.status === JobStatus.ERROR ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
           <button 
            onClick={() => onToggle(job.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
          >
            {job.status === JobStatus.RUNNING ? (
              <><Pause size={14} /> Pause</>
            ) : (
              <><Play size={14} /> Resume</>
            )}
          </button>
          
          {(job.status === JobStatus.ERROR || job.status === JobStatus.RETRYING) ? (
            <button 
              onClick={() => onAnalyze(job, 'DIAGNOSIS')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded transition-colors ml-auto animate-pulse"
            >
              <Bug size={14} /> Investigate Error
            </button>
          ) : (
            <button 
               onClick={() => onAnalyze(job, 'OPTIMIZATION')}
               className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded transition-colors ml-auto"
            >
              <Server size={14} /> Schema AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
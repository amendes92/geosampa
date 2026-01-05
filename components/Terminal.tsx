import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs h-96 flex flex-col shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        <span className="ml-2 text-slate-500">pipeline_logs.log</span>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-500 shrink-0">
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>
            <span className={`font-bold shrink-0 w-16 ${
              log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'WARN' ? 'text-yellow-400' :
              log.level === 'ERROR' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {log.level}
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
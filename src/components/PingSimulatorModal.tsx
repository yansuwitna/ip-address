import React, { useState, useEffect } from 'react';
import { X, Activity, Play, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { IPAllocation } from '../types/ipam';

interface PingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: IPAllocation | null;
  onUpdateStatus: (id: string, status: 'online' | 'offline', latency: number) => void;
}

export const PingSimulatorModal: React.FC<PingSimulatorModalProps> = ({
  isOpen,
  onClose,
  allocation,
  onUpdateStatus
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [resultStatus, setResultStatus] = useState<'online' | 'offline' | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => {
    if (isOpen && allocation) {
      setLogs([`Siap menguji koneksi ke ${allocation.hostname} (${allocation.ip})...`]);
      setResultStatus(null);
      setIsRunning(false);
      setSimulateFailure(allocation.status === 'reserved');
    }
  }, [isOpen, allocation]);

  if (!isOpen || !allocation) return null;

  const runPing = async () => {
    setIsRunning(true);
    setResultStatus(null);
    setLogs([`PING ${allocation.ip} (${allocation.ip}) 56(84) bytes of data.`]);

    let successfulPings = 0;
    const latencies: number[] = [];

    for (let seq = 1; seq <= 4; seq++) {
      await new Promise(resolve => setTimeout(resolve, 600));

      if (simulateFailure) {
        setLogs(prev => [...prev, `Request timeout for icmp_seq ${seq}`]);
      } else {
        const time = +(Math.random() * 2.5 + 0.5).toFixed(2);
        latencies.push(time);
        successfulPings++;
        setLogs(prev => [
          ...prev,
          `64 bytes from ${allocation.ip}: icmp_seq=${seq} ttl=64 time=${time} ms`
        ]);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    if (simulateFailure || successfulPings === 0) {
      setLogs(prev => [
        ...prev,
        `--- ${allocation.ip} ping statistics ---`,
        `4 packets transmitted, 0 received, 100% packet loss`
      ]);
      setResultStatus('offline');
      onUpdateStatus(allocation.id, 'offline', 0);
    } else {
      const avg = +(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);
      setLogs(prev => [
        ...prev,
        `--- ${allocation.ip} ping statistics ---`,
        `4 packets transmitted, 4 received, 0% packet loss, time 2008ms`,
        `rtt min/avg/max = ${min}/${avg}/${max} ms`
      ]);
      setResultStatus('online');
      onUpdateStatus(allocation.id, 'online', avg);
    }

    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Simulasi Uji Ping (ICMP)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {allocation.hostname} • {allocation.ip}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Controls */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                disabled={isRunning}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Simulasikan Perangkat Offline (Timeout)</span>
            </label>

            <button
              onClick={runPing}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Menguji...' : 'Mulai Ping'}</span>
            </button>
          </div>

          {/* Terminal Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1 shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-500 mb-2 border-b border-slate-800 pb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>icmp_ping_diagnostic.sh</span>
            </div>
            {logs.map((line, idx) => (
              <div 
                key={idx} 
                className={
                  line.includes('timeout') || line.includes('100% packet loss')
                    ? 'text-rose-400'
                    : line.includes('ttl=64')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Result Badge */}
          {resultStatus && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              resultStatus === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {resultStatus === 'online' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {resultStatus === 'online' ? 'Perangkat Berhasil Menjawab (Online)' : 'Perangkat Tidak Merespon (Host Unreachable)'}
                </p>
                <p className="text-[11px] opacity-80">
                  Status telah disimpan secara otomatis pada data alokasi IP ini.
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

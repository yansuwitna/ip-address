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
      setLogs([`Siap menguji konektivitas ICMP ke ${allocation.hostname} (${allocation.ip})...`]);
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
      await new Promise(resolve => setTimeout(resolve, 550));

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

    await new Promise(resolve => setTimeout(resolve, 350));

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
        `4 packets transmitted, 4 received, 0% packet loss`,
        `rtt min/avg/max = ${min}/${avg}/${max} ms`
      ]);
      setResultStatus('online');
      onUpdateStatus(allocation.id, 'online', avg);
    }

    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Simulasi Uji Ping (ICMP)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {allocation.hostname} • <span className="font-bold text-blue-600">{allocation.ip}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Controls */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                disabled={isRunning}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Simulasikan Perangkat Offline (Timeout)</span>
            </label>

            <button
              onClick={runPing}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Menguji...' : 'Mulai Ping'}</span>
            </button>
          </div>

          {/* Terminal Console (Unix Tech style) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-slate-500 mb-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px]">terminal@ipaddress:~$ ping {allocation.ip}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              </div>
            </div>
            {logs.map((line, idx) => (
              <div 
                key={idx} 
                className={
                  line.includes('timeout') || line.includes('100% packet loss')
                    ? 'text-rose-400 font-semibold'
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
            <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-medium ${
              resultStatus === 'online'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {resultStatus === 'online' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {resultStatus === 'online' ? 'Perangkat Online (Menjawab)' : 'Perangkat Offline (Tidak Merespon)'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Hasil diagnostik berhasil disimpan ke profil alokasi IP ini.
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

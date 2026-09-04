import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Server
} from 'lucide-react';
import { IPAllocation } from '../types/ipam';

interface PingViewProps {
  allocations: IPAllocation[];
  onUpdateStatus: (id: string, status: 'online' | 'offline', latency: number) => void;
}

export const PingView: React.FC<PingViewProps> = ({
  allocations,
  onUpdateStatus
}) => {
  const [targetIp, setTargetIp] = useState(allocations[0]?.ip || '192.168.10.1');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Pilih perangkat atau masukkan alamat IP di atas, lalu klik "Mulai Ping ICMP".'
  ]);
  const [resultStatus, setResultStatus] = useState<'online' | 'offline' | null>(null);
  const [simulateOffline, setSimulateOffline] = useState(false);

  const selectedAlloc = allocations.find(a => a.ip === targetIp);

  const handleRunPing = async () => {
    setIsRunning(true);
    setResultStatus(null);
    setLogs([`PING ${targetIp} (${targetIp}) 56(84) bytes of data.`]);

    let successfulPings = 0;
    const latencies: number[] = [];

    for (let seq = 1; seq <= 4; seq++) {
      await new Promise(resolve => setTimeout(resolve, 550));

      if (simulateOffline) {
        setLogs(prev => [...prev, `Request timeout for icmp_seq ${seq}`]);
      } else {
        const time = +(Math.random() * 2.5 + 0.5).toFixed(2);
        latencies.push(time);
        successfulPings++;
        setLogs(prev => [
          ...prev,
          `64 bytes from ${targetIp}: icmp_seq=${seq} ttl=64 time=${time} ms`
        ]);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 350));

    if (simulateOffline || successfulPings === 0) {
      setLogs(prev => [
        ...prev,
        `--- ${targetIp} ping statistics ---`,
        `4 packets transmitted, 0 received, 100% packet loss`
      ]);
      setResultStatus('offline');
      if (selectedAlloc) {
        onUpdateStatus(selectedAlloc.id, 'offline', 0);
      }
    } else {
      const avg = +(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);
      setLogs(prev => [
        ...prev,
        `--- ${targetIp} ping statistics ---`,
        `4 packets transmitted, 4 received, 0% packet loss`,
        `rtt min/avg/max = ${min}/${avg}/${max} ms`
      ]);
      setResultStatus('online');
      if (selectedAlloc) {
        onUpdateStatus(selectedAlloc.id, 'online', avg);
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Alat Diagnostik Ping (ICMP)
            </h2>
            <p className="text-xs text-slate-500">
              Uji latensi respon dan ketersediaan konektivitas host jaringan secara interaktif.
            </p>
          </div>
        </div>
      </div>

      {/* Control Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* IP Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih dari Host Terdaftar atau Ketik IP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                placeholder="Contoh: 192.168.10.1"
                className="flex-1 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <select
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">-- Pilih Host Terdaftar --</option>
                {allocations.map(a => (
                  <option key={a.id} value={a.ip}>
                    {a.ip} - {a.hostname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleRunPing}
              disabled={isRunning || !targetIp.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Sedang Menguji...' : 'Mulai Ping ICMP'}</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateOffline}
              onChange={(e) => setSimulateOffline(e.target.checked)}
              disabled={isRunning}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span>Simulasikan Kondisi Host Offline (Timeout)</span>
          </label>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-xs text-slate-300 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold">terminal@netipam:~$ ping -c 4 {targetIp}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
        </div>

        <div className="space-y-1 pt-2 min-h-[160px]">
          {logs.map((line, idx) => (
            <div 
              key={idx}
              className={
                line.includes('timeout') || line.includes('100% packet loss')
                  ? 'text-rose-400 font-semibold'
                  : line.includes('ttl=64')
                  ? 'text-emerald-400'
                  : line.includes('statistics')
                  ? 'text-cyan-300 font-semibold pt-1'
                  : 'text-slate-300'
              }
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {resultStatus && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
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
            <p className="font-bold text-sm">
              {resultStatus === 'online' ? 'Hasil: Host Online & Merespon Baik' : 'Hasil: Host Offline / Unreachable'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              Status koneksi host {targetIp} telah dicatat pada sistem.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

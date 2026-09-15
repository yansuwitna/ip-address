const fs = require('fs');

let content = fs.readFileSync('src/components/TampilanSound.tsx', 'utf-8');

// Icons
content = content.replace(/Video/g, 'Volume2');
content = content.replace(/Camera/g, 'Speaker');
// Fix import 
if (content.includes('import {')) {
  content = content.replace('import {', 'import { Volume2, Speaker as SpeakerIcon,');
}

// Map hardware types
const oldGetTypeName = `
  const getTypeName = (typeCode: string) => {
    switch (typeCode) {
      case 'speaker_ip_dome': return 'Speaker Dome / Indoor';
      case 'speaker_ip_bullet': return 'Speaker Bullet / Outdoor';
      case 'speaker_ip_ptz': return 'Speaker PTZ (Pan Tilt Zoom)';
      case 'nvr': return 'NVR (Network Video Recorder)';
      case 'dvr': return 'DVR (Digital Video Recorder)';
      case 'switch_poe': return 'Switch PoE';
      case 'storage_nas': return 'Storage NAS';
      case 'monitor_matrix': return 'Monitor Matrix / Display';
      default: return 'Perangkat Sound Lainnya';
    }
  };
`;
const newGetTypeName = `
  const getTypeName = (typeCode: string) => {
    switch (typeCode) {
      case 'speaker': return 'Speaker / Pengeras Suara';
      case 'amplifier': return 'Amplifier / Penguat Suara';
      case 'mixer': return 'Audio Mixer';
      case 'microphone': return 'Microphone';
      case 'dsp': return 'Digital Signal Processor (DSP)';
      default: return 'Perangkat Sound Lainnya';
    }
  };
`;
content = content.replace(/const getTypeName[\s\S]*?\};/m, newGetTypeName.trim());

// Render options
content = content.replace(/<option value="speaker_ip_bullet">Speaker Bullet<\/option>/g, '<option value="speaker">Speaker</option>');
content = content.replace(/<option value="speaker_ip_dome">Speaker Dome<\/option>/g, '<option value="amplifier">Amplifier</option>');
content = content.replace(/<option value="nvr">NVR \/ Recorder<\/option>/g, '<option value="mixer">Audio Mixer</option>');
content = content.replace(/<option value="switch_poe">Switch PoE Sound<\/option>/g, '<option value="microphone">Microphone</option>');

// Update rendering of Device Card
const oldDetails = `
                  <div className="grid grid-cols-2 gap-y-2 mt-4 text-[10px] sm:text-xs">
                    <div className="text-slate-500 flex items-center gap-1.5"><MapPin size={12}/> {dev.location}</div>
                    {dev.ipAddress && <div className="text-slate-500 font-mono text-right flex justify-end items-center gap-1"><Monitor size={12}/> {dev.ipAddress}</div>}
                    {dev.brand && <div className="text-slate-500 flex items-center gap-1"><Layers size={12}/> {dev.brand} {dev.model}</div>}
                    {dev.resolution && <div className="text-slate-500 text-right font-medium text-slate-700 dark:text-slate-300 flex justify-end items-center gap-1"><Camera size={12}/> {dev.resolution}</div>}
                  </div>
`;
const newDetails = `
                  <div className="grid grid-cols-2 gap-y-2 mt-4 text-[10px] sm:text-xs">
                    <div className="text-slate-500 flex items-center gap-1.5"><MapPin size={12}/> {dev.location}</div>
                    {dev.brand && <div className="text-slate-500 flex items-center justify-end gap-1"><Layers size={12}/> {dev.brand} {dev.model}</div>}
                    {dev.powerWatt && <div className="text-slate-500 flex items-center gap-1">Daya: {dev.powerWatt}W</div>}
                    {dev.impedanceOhm && <div className="text-slate-500 text-right flex justify-end items-center gap-1">Impedansi: {dev.impedanceOhm}Ω</div>}
                  </div>
`;
// Need to match exactly or just replace it via regex
content = content.replace(/<div className="grid grid-cols-2 gap-y-2 mt-4 text-\[10px\] sm:text-xs">[\s\S]*?<\/div>/m, newDetails.trim());

// Update KPIS
content = content.replace(/Total Kamera & NVR/g, 'Total Alat Sound');
content = content.replace(/Total Kabel & UTP/g, 'Total Kabel Audio');

fs.writeFileSync('src/components/TampilanSound.tsx', content);


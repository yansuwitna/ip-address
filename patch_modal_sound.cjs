const fs = require('fs');

// PATCH MODAL SOUND
let content = fs.readFileSync('src/components/ModalSound.tsx', 'utf-8');

// Replace NVR list with general usage or remove
content = content.replace(/existingNvrList: SoundDevice\[\];/g, '');
content = content.replace(/existingNvrList,/g, '');

// State replacements
const oldStates = `
  const [resolution, setResolution] = useState('');
  const [channelNumber, setChannelNumber] = useState<number | ''>('');
  const [nvrId, setNvrId] = useState('');
  const [poePort, setPoePort] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [storageDays, setStorageDays] = useState<number | ''>('');
`;
const newStates = `
  const [powerWatt, setPowerWatt] = useState<number | ''>('');
  const [impedanceOhm, setImpedanceOhm] = useState<number | ''>('');
`;
content = content.replace(oldStates.trim(), newStates.trim());

// useEffect reset
const oldReset = `
      setResolution(editDevice.resolution || '');
      setChannelNumber(editDevice.channelNumber || '');
      setNvrId(editDevice.nvrId || '');
      setPoePort(editDevice.poePort || '');
      setRtspUrl(editDevice.rtspUrl || '');
      setStorageDays(editDevice.storageDays || '');
`;
const newReset = `
      setPowerWatt(editDevice.powerWatt || '');
      setImpedanceOhm(editDevice.impedanceOhm || '');
`;
content = content.replace(oldReset.trim(), newReset.trim());

const oldEmpty = `
      setResolution('');
      setChannelNumber('');
      setNvrId('');
      setPoePort('');
      setRtspUrl('');
      setStorageDays('');
`;
const newEmpty = `
      setPowerWatt('');
      setImpedanceOhm('');
`;
content = content.replace(oldEmpty.trim(), newEmpty.trim());

// handleSubmit
const oldSubmit = `
      resolution,
      channelNumber: channelNumber === '' ? undefined : Number(channelNumber),
      nvrId: nvrId || undefined,
      poePort,
      rtspUrl,
      storageDays: storageDays === '' ? undefined : Number(storageDays),
`;
const newSubmit = `
      powerWatt: powerWatt === '' ? undefined : Number(powerWatt),
      impedanceOhm: impedanceOhm === '' ? undefined : Number(impedanceOhm),
`;
content = content.replace(oldSubmit.trim(), newSubmit.trim());

// JSX form fields
const oldJsxForm = /\{\/\* Spesifikasi Teknis \*\/\}[\s\S]*?(?=\{\/\* Informasi Status & Instalasi \*\/)/m;
const newJsxForm = `{/* Spesifikasi Teknis */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center mb-2">
                <AlertCircle size={16} className="mr-2 text-indigo-500" />
                Spesifikasi Teknis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Daya (Watt)</label>
                  <input
                    type="number"
                    value={powerWatt}
                    onChange={(e) => setPowerWatt(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                    placeholder="Contoh: 15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Impedansi (Ohm)</label>
                  <input
                    type="number"
                    value={impedanceOhm}
                    onChange={(e) => setImpedanceOhm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                    placeholder="Contoh: 8"
                  />
                </div>
              </div>
            </div>

            `;
content = content.replace(oldJsxForm, newJsxForm);

fs.writeFileSync('src/components/ModalSound.tsx', content);


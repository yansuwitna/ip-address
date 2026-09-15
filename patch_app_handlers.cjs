const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const soundHandlers = `
  const handleSaveSoundDevice = (devData: Partial<SoundDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setSoundDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as SoundDevice : d));
      showSuccess('Perangkat Sound berhasil diperbarui!');
    } else {
      const newDev: SoundDevice = {
        ...devData,
        id: \`snd-\${Date.now()}\`,
        createdAt: now,
        updatedAt: now
      } as SoundDevice;
      setSoundDevices(prev => [...prev, newDev]);
      showSuccess('Perangkat Sound baru berhasil ditambahkan!');
    }
  };

  const handleDeleteSoundDevice = (id: string) => {
    setSoundDevices(prev => prev.filter(d => d.id !== id));
    // Also delete connected cables
    setSoundCables(prev => prev.filter(c => c.sourceDeviceId !== id && c.targetDeviceId !== id));
  };

  const handleSaveSoundCable = (cableData: Partial<SoundCableRun>) => {
    const now = new Date().toISOString();
    if (cableData.id) {
      setSoundCables(prev => prev.map(c => c.id === cableData.id ? { ...c, ...cableData, updatedAt: now } as SoundCableRun : c));
      showSuccess('Jalur kabel Sound berhasil diperbarui!');
    } else {
      const newCable: SoundCableRun = {
        ...cableData,
        id: \`snd-cbl-\${Date.now()}\`,
        createdAt: now,
        updatedAt: now
      } as SoundCableRun;
      setSoundCables(prev => [...prev, newCable]);
      showSuccess('Jalur kabel Sound baru berhasil dicatat!');
    }
  };

  const handleDeleteSoundCable = (id: string) => {
    setSoundCables(prev => prev.filter(c => c.id !== id));
  };

  // SOUND TYPES
  const handleSaveSoundDeviceType = (typeItem: any) => {
    const now = new Date().toISOString();
    if (typeItem.id) {
      setSoundDeviceTypes(prev => prev.map(t => t.id === typeItem.id ? { ...t, ...typeItem, updatedAt: now } : t));
    } else {
      setSoundDeviceTypes(prev => [...prev, { ...typeItem, id: \`st-\${Date.now()}\`, createdAt: now, updatedAt: now }]);
    }
  };

  const handleDeleteSoundDeviceType = (id: string) => {
    setSoundDeviceTypes(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveSoundCableType = (typeItem: any) => {
    const now = new Date().toISOString();
    if (typeItem.id) {
      setSoundCableTypes(prev => prev.map(t => t.id === typeItem.id ? { ...t, ...typeItem, updatedAt: now } : t));
    } else {
      setSoundCableTypes(prev => [...prev, { ...typeItem, id: \`sct-\${Date.now()}\`, createdAt: now, updatedAt: now }]);
    }
  };

  const handleDeleteSoundCableType = (id: string) => {
    setSoundCableTypes(prev => prev.filter(t => t.id !== id));
  };
`;

content = content.replace("  const handleSaveCctvDevice = ", soundHandlers + "\n  const handleSaveCctvDevice = ");

// Add use effects for sync
const syncEffects = `
  useEffect(() => {
    if (!isSyncing && currentTab === 'sound') {
      import('./utils/penyimpanan').then(m => m.saveSoundDevices(soundDevices));
    }
  }, [soundDevices, isSyncing, currentTab]);

  useEffect(() => {
    if (!isSyncing && currentTab === 'sound') {
      import('./utils/penyimpanan').then(m => m.saveSoundCableRuns(soundCables));
    }
  }, [soundCables, isSyncing, currentTab]);

  useEffect(() => {
    if (!isSyncing && currentTab === 'sound_device_types') {
      import('./utils/penyimpanan').then(m => m.saveSoundDeviceTypes(soundDeviceTypes));
    }
  }, [soundDeviceTypes, isSyncing, currentTab]);

  useEffect(() => {
    if (!isSyncing && currentTab === 'sound_cable_types') {
      import('./utils/penyimpanan').then(m => m.saveSoundCableTypes(soundCableTypes));
    }
  }, [soundCableTypes, isSyncing, currentTab]);
`;

content = content.replace("  // --- TAB CCTVs ---", syncEffects + "\n  // --- TAB CCTVs ---");

// Check if render for master tabs missing
const renderMasterTabs = `
          {currentTab === 'sound_device_types' && (
            <MasterTypeView
              title="Master Tipe Perangkat Sound"
              description="Kelola jenis perangkat Sound seperti Speaker, Amplifier, dll"
              items={soundDeviceTypes}
              onSaveItem={handleSaveSoundDeviceType}
              onDeleteItem={handleDeleteSoundDeviceType}
            />
          )}

          {currentTab === 'sound_cable_types' && (
            <MasterTypeView
              title="Master Jenis Kabel Sound"
              description="Kelola jenis kabel dan konektor untuk jaringan Audio"
              items={soundCableTypes}
              onSaveItem={handleSaveSoundCableType}
              onDeleteItem={handleDeleteSoundCableType}
            />
          )}
`;
content = content.replace("{/* TAB: PENGGUNA */}", renderMasterTabs + "\n          {/* TAB: PENGGUNA */}");


fs.writeFileSync('src/App.tsx', content);


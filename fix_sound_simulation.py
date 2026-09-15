import re

# ModalDiagramSimulasi.tsx
with open('src/components/ModalDiagramSimulasi.tsx', 'r') as f:
    mds = f.read()

# Make sure Volume2 is imported if we use it, we can just use Speaker or AudioWave if available, but Volume2 is standard in lucide-react.
if 'Volume2' not in mds:
    mds = mds.replace('import {', 'import { Volume2,', 1)

sound_config = """
      case 'sound':
        return {
          title: 'Simulasi Topologi Jaringan Tata Suara (Sound) & Audio',
          badgeText: 'Kabel Audio / Speaker',
          icon: Volume2,
          headerGradient: 'from-indigo-600 to-purple-600',
          accentColor: '#6366f1',
          cableLabel: 'Jalur Kabel Sound',
          particleColor: '#c7d2fe'
        };
"""
if "case 'sound':" not in mds:
    mds = mds.replace("case 'lan':", sound_config + "      case 'lan':")

sound_icon = """
    if (utilityType === 'sound') {
      if (t.includes('mixer')) return <Layers className="w-5 h-5 text-purple-400" />;
      if (t.includes('amplifier') || t.includes('dsp')) return <Server className="w-5 h-5 text-indigo-400" />;
      return <Volume2 className="w-5 h-5 text-indigo-400" />;
    }
"""
if "utilityType === 'sound'" not in mds:
    mds = mds.replace("if (utilityType === 'air') {", sound_icon + "    if (utilityType === 'air') {")

# Also fix the label if sound device doesn't have ipAddress. It defaults to code which is fine.
sound_label = """
                  } else if (utilityType === 'sound') {
                    detailText = dev.powerWatt ? `${dev.powerWatt}W` : (dev.code || '-');
"""
if "utilityType === 'sound'" not in mds:
    mds = mds.replace("} else if (utilityType === 'air') {", sound_label + "                  } else if (utilityType === 'air') {")

with open('src/components/ModalDiagramSimulasi.tsx', 'w') as f:
    f.write(mds)

# TampilanSound.tsx
with open('src/components/TampilanSound.tsx', 'r') as f:
    ts = f.read()

if 'utilityType="sound"' not in ts:
    ts = ts.replace('<ModalDiagramSimulasi\n          isOpen={isSimulationModalOpen}', '<ModalDiagramSimulasi\n          utilityType="sound"\n          isOpen={isSimulationModalOpen}')

with open('src/components/TampilanSound.tsx', 'w') as f:
    f.write(ts)

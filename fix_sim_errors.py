import re

with open('src/components/ModalDiagramSimulasi.tsx', 'r') as f:
    mds = f.read()

# Fix SimulationUtilityType
mds = mds.replace("type SimulationUtilityType = 'lan' | 'listrik' | 'cctv' | 'air';", "type SimulationUtilityType = 'lan' | 'listrik' | 'cctv' | 'air' | 'sound';")

# Fix Volume2 import
mds = mds.replace("import { Volume2, ModalPortal } from './ModalPortal';", "import { ModalPortal } from './ModalPortal';")
mds = mds.replace("} from 'lucide-react';", "  Volume2\n} from 'lucide-react';")

# My previous script inserted the if (utilityType === 'sound') three times because if (utilityType === 'air') occurs multiple times.
# Wait, let's see where the original if (utilityType === 'air') was.
# I will just revert my previous bad replacements and do them right.
# Let's remove ALL occurrences of my bad block:
bad_block_icon = """    if (utilityType === 'sound') {
      if (t.includes('mixer')) return <Layers className="w-5 h-5 text-purple-400" />;
      if (t.includes('amplifier') || t.includes('dsp')) return <Server className="w-5 h-5 text-indigo-400" />;
      return <Volume2 className="w-5 h-5 text-indigo-400" />;
    }
"""
mds = mds.replace(bad_block_icon, "")

bad_block_label = """                  } else if (utilityType === 'sound') {
                    detailText = dev.powerWatt ? `${dev.powerWatt}W` : (dev.code || '-');
"""
mds = mds.replace(bad_block_label, "")

# Now insert them correctly by using more specific matches.
# 1. renderDeviceIcon
# We want to find:
#    if (utilityType === 'air') {
#      return <Droplets className="w-5 h-5 text-cyan-400" />;
#    }
# And add sound BEFORE it.
correct_icon = """    if (utilityType === 'sound') {
      if (t.includes('mixer')) return <Layers className="w-5 h-5 text-purple-400" />;
      if (t.includes('amplifier') || t.includes('dsp')) return <Server className="w-5 h-5 text-indigo-400" />;
      return <Volume2 className="w-5 h-5 text-indigo-400" />;
    }
"""
mds = mds.replace("    if (utilityType === 'air') {\n      return <Droplets", correct_icon + "    if (utilityType === 'air') {\n      return <Droplets")

# 2. sub-detail label
# We want to find:
#                  } else if (utilityType === 'air') {
#                    detailText = dev.pipeDiameter ? `Ø ${dev.pipeDiameter}` : (dev.code || '-');
#                  } else {
correct_label = """                  } else if (utilityType === 'sound') {
                    detailText = (dev as any).powerWatt ? `${(dev as any).powerWatt}W` : (dev.code || '-');
"""
mds = mds.replace("                  } else if (utilityType === 'air') {", correct_label + "                  } else if (utilityType === 'air') {")


with open('src/components/ModalDiagramSimulasi.tsx', 'w') as f:
    f.write(mds)

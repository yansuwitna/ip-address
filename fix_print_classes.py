import re

with open('src/components/ModalDiagramSimulasi.tsx', 'r') as f:
    mds = f.read()

# sim-node-box
# The rect for node box has `className="transition-all group-hover:stroke-sky-500 shadow-2xl"`
mds = mds.replace('className="transition-all group-hover:stroke-sky-500 shadow-2xl"', 'className="transition-all group-hover:stroke-sky-500 shadow-2xl sim-node-box"')

# sim-node-circle
# The circle for icon has:
# <circle
#   r="16"
#   fill="#0f172a"
#   stroke="#1e293b"
#   strokeWidth="1"
# />
mds = re.sub(r'(<circle[^>]*?fill="#0f172a"[^>]*?stroke="#1e293b"[^>]*?strokeWidth="1"[^>]*?)/?>', r'\1 className="sim-node-circle" />', mds)

# sim-node-name
# The text for device name has:
# className="truncate pointer-events-none tracking-wide"
mds = mds.replace('className="truncate pointer-events-none tracking-wide"', 'className="truncate pointer-events-none tracking-wide sim-node-name"')

# sim-node-detail
# The text for sub-detail has:
# className="pointer-events-none" (wait, there are many pointer-events-none, let's use the one with fill="#94a3b8" and fontFamily="monospace")
mds = re.sub(r'(<text[^>]*?fill="#94a3b8"[^>]*?fontFamily="monospace"[^>]*?className=")(pointer-events-none)(")', r'\1\2 sim-node-detail\3', mds)

# sim-cable-badge
# The rect for cable badge has `className="shadow-md"` inside the `Pill Badge Label` block.
mds = mds.replace('className="shadow-md"', 'className="shadow-md sim-cable-badge"')

# sim-cable-text
# The text for cable badge doesn't have a className, it has `letterSpacing="0.5" >`
# Let's add className="sim-cable-text"
mds = mds.replace('letterSpacing="0.5"\n                        >', 'letterSpacing="0.5"\n                          className="sim-cable-text"\n                        >')

# sim-connector-dot
# circle with stroke="#080e1a"
mds = re.sub(r'(<circle[^>]*?stroke="#080e1a"[^>]*?)/?>', r'\1 className="sim-connector-dot" />', mds)

# also the text for Virtual Source/Target has fill="#94a3b8" and className="pointer-events-none"
mds = re.sub(r'(<text[^>]*?fill="#94a3b8"[^>]*?className=")(pointer-events-none)(")', r'\1\2 sim-node-detail\3', mds)

with open('src/components/ModalDiagramSimulasi.tsx', 'w') as f:
    f.write(mds)


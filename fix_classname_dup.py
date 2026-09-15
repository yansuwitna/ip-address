import re

with open('src/components/ModalDiagramSimulasi.tsx', 'r') as f:
    mds = f.read()

# find any case of className="..." ... className="..."
# Since we just added it, we know the exact string:
# className="pointer-events-none"
# style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))' }}
# className="sim-connector-dot" />

mds = mds.replace('className="pointer-events-none"\n                        style={{ filter: \'drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))\' }}\n                       className="sim-connector-dot" />', 'className="pointer-events-none sim-connector-dot"\n                        style={{ filter: \'drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))\' }} />')

with open('src/components/ModalDiagramSimulasi.tsx', 'w') as f:
    f.write(mds)

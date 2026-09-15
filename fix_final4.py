with open('src/components/ModalKabelSound.tsx', 'r') as f:
    mks = f.read()

mks = mks.replace("sourceLocation: '',\n    targetLocation: '',\n    sourceLocation: '',\n    targetLocation: '',", "sourceLocation: '',\n    targetLocation: '',")
mks = mks.replace("sourceLocation: '',\n        targetLocation: '',\n        sourceLocation: '',\n        targetLocation: '',", "sourceLocation: '',\n        targetLocation: '',")
mks = mks.replace("sourceLocation: src,\n      targetLocation: tgt,\n      sourceLocation: src,\n      targetLocation: tgt,", "sourceLocation: src,\n      targetLocation: tgt,")

with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.write(mks)

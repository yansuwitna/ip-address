import re

with open('src/components/ModalSound.tsx', 'r') as f:
    ms = f.read()

ms = re.sub(r'const \[channelNumber, setChannelNumber\] = useState<string>\(\'\'\);\n', '', ms)
ms = re.sub(r'channelNumber: channelNumber \? Number\(channelNumber\) : undefined,\n', '', ms)
# delete the channelNumber JSX block (it might be in the form)
ms = re.sub(r'<div[^>]*>\s*<label[^>]*>\s*Jumlah Channel.*?</div>', '', ms, flags=re.DOTALL)
# The label might just be "Channel" or something
ms = re.sub(r'<div[^>]*>\s*<label[^>]*>.*?Channel.*?</label>[\s\S]*?</div>', '', ms)
with open('src/components/ModalSound.tsx', 'w') as f:
    f.write(ms)

with open('src/components/ModalKabelSound.tsx', 'r') as f:
    mks = f.read()
# Replace ALL duplicate object fields one last time by simple replacement
# In JS, the first instance is ignored and the last takes effect. I will just search for duplicate properties.
mks = re.sub(r'(sourceLocation:\s*[^,]+,\s*)sourceLocation:\s*[^,]+,', r'\1', mks)
mks = re.sub(r'(targetLocation:\s*[^,]+,\s*)targetLocation:\s*[^,]+,', r'\1', mks)
with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.write(mks)

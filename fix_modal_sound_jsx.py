import re

with open('src/components/ModalSound.tsx', 'r') as f:
    ms = f.read()

# The block starts with <div className="p-4 bg-slate-50... Integrasi NVR & Video Streaming
# Let's just find "Integrasi NVR & Video Streaming" and remove its parent div.
# But it's easier to use a regex if we match until the next <div className="grid or something?
# No, let's just match from `<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">`
# all the way up to where it ends. The end of this div is just before `{/* Penanggung Jawab */}` or something similar.
ms = re.sub(r'<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">\s*<h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">\s*Integrasi NVR & Video Streaming\s*</h4>[\s\S]*?(?={/\*\s*Catatan\s*\*/})', '', ms)

# If it didn't match perfectly, let's just remove anything referencing channelNumber, poePort, resolution, storageDays in the TSX.
# wait, there's another block for RTSP URL.
ms = re.sub(r'<div className="col-span-1 sm:col-span-3">[\s\S]*?RTSP Stream URL[\s\S]*?</div>', '', ms)
with open('src/components/ModalSound.tsx', 'w') as f:
    f.write(ms)

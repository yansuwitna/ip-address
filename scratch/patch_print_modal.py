import os

filepath = 'src/components/PrintModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace Root wrapper
old_root = """  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      {/* Container Dialog */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">"""

new_root = """  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col">"""
content = content.replace(old_root, new_root)

# Replace Printable Paper Canvas wrapper
old_canvas = """        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 print:p-0 print:bg-white dark:bg-slate-900 print:overflow-visible">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto font-sans leading-normal">"""

new_canvas = """        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:overflow-visible flex flex-col items-center">
          <div className="bg-white text-black p-8 sm:p-12 shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 w-full max-w-[21cm] min-h-[29.7cm] font-sans leading-normal">"""
content = content.replace(old_canvas, new_canvas)


with open(filepath, 'w') as f:
    f.write(content)
print("PrintModal.tsx patched.")

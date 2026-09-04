#!/bin/bash
find src -name "*.tsx" | while read -r file; do
  # find lines with bg-white but no dark:bg-
  grep -n "bg-white" "$file" | grep -v "dark:bg-" && echo "$file: missing dark:bg- on bg-white"
  # find lines with bg-slate-50 but no dark:bg-
  grep -n "bg-slate-50" "$file" | grep -v "dark:bg-" && echo "$file: missing dark:bg- on bg-slate-50"
  grep -n "bg-slate-100" "$file" | grep -v "dark:bg-" && echo "$file: missing dark:bg- on bg-slate-100"
  grep -n "bg-slate-200" "$file" | grep -v "dark:bg-" && echo "$file: missing dark:bg- on bg-slate-200"
done

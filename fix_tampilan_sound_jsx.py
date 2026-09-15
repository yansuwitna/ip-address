import re

with open('src/components/TampilanSound.tsx', 'r') as f:
    ts = f.read()

# Fix the dangling closing tags
ts = ts.replace('                            </div>\n                          )}\n                        </div>\n                      </div>', '                        </div>\n                      </div>')

# Wait, there's another JSX issue I need to be sure about.
# Let's just find `</span>\n                          </div>\n                            </div>\n                          )}`
ts = re.sub(r'</span>\s*</div>\s*</div>\s*\)\}', '</span>\n                          </div>', ts)

with open('src/components/TampilanSound.tsx', 'w') as f:
    f.write(ts)

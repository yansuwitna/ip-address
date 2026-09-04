import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add dnsRecords to HomeView invocations
old_home1 = """      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        currentUser={null}
        onNavigateToLogin={() => setAuthView('login')}
      />"""

new_home1 = """      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        dnsRecords={dnsRecords}
        currentUser={null}
        onNavigateToLogin={() => setAuthView('login')}
      />"""

old_home2 = """      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        currentUser={currentUser}
        onNavigateToLogin={() => setIsViewingPublicHome(false)}
        onNavigateToDashboard={() => setIsViewingPublicHome(false)}
      />"""

new_home2 = """      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        dnsRecords={dnsRecords}
        currentUser={currentUser}
        onNavigateToLogin={() => setIsViewingPublicHome(false)}
        onNavigateToDashboard={() => setIsViewingPublicHome(false)}
      />"""

content = content.replace(old_home1, new_home1)
content = content.replace(old_home2, new_home2)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched.")

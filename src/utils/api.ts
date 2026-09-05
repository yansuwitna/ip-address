export async function syncToServer(key: string, data: any) {
  try {
    await fetch(`/api/store/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error(`Failed to sync ${key} to server:`, error);
  }
}

export async function fetchFromServer() {
  try {
    const res = await fetch('/api/store/all');
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error(`Failed to fetch from server:`, error);
  }
  return null;
}

export async function wipeServer() {
  try {
    await fetch('/api/store/all', {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to wipe server:', error);
  }
}

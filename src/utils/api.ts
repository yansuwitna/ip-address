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

export async function loginDirectToServer(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to login via server:', error);
    return { success: false, error: 'Tidak dapat menghubungi server database.' };
  }
}

export async function loginWithTokenDirectToServer(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to login with token via server:', error);
    return { success: false, error: 'Tidak dapat menghubungi server database.' };
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

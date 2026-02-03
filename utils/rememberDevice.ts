import * as SecureStore from 'expo-secure-store';

const KEY = 'remember_me';

export async function setRememberDevice(value: boolean) {
  try {
    await SecureStore.setItemAsync(KEY, value ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
}

export async function getRememberDevice(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    return v === 'true';
  } catch (e) {
    return true;
  }
}

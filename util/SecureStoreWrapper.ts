import * as SecureStore from "expo-secure-store"; 

type SecureStoreKey = 
  | "baseUrl"
  | "token"
  | "cipher";

class SecureStoreWrapper {
  public static async getItem(key: SecureStoreKey): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  public static async setItem(key: SecureStoreKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  public static async deleteItem(key: SecureStoreKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

export default SecureStoreWrapper;

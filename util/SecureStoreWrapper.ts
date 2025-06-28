/*
 * auff: A mobile client for 2FAuth
 * Copyright (C) 2025  povario
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as SecureStore from "expo-secure-store";

type SecureStoreKey = "baseUrl" | "token" | "cipher";

class SecureStoreWrapper {
  public static async getItem(key: SecureStoreKey): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  public static async setItem(
    key: SecureStoreKey,
    value: string
  ): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  public static async deleteItem(key: SecureStoreKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

export default SecureStoreWrapper;

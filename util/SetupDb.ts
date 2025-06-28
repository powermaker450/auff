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

import * as Crypto from "expo-crypto";
import { type SQLiteDatabase } from "expo-sqlite";
import SecureStoreWrapper from "./SecureStoreWrapper";

export type ConfigKey =
  | "includedGroups"
  | "excludedGroups"
  | "useBiometrics"
  | "showOtpCode";

type ConfigBinaryOption = "0" | "1";

export type ConfigOption<T extends ConfigKey | unknown = unknown> = T extends
  | "useBiometrics"
  | "showOtpCode"
  ? ConfigBinaryOption
  : string;

export interface ConfigResult<K extends ConfigKey> {
  key: K;
  value: ConfigOption<K>;
}

export enum PendingReason {
  Create,
  Delete
}

export interface PendingResult {
  id: number;
  action: PendingReason;
}

export default async function SetupDb(db: SQLiteDatabase) {
  let key = await SecureStoreWrapper.getItem("cipher");

  if (!key) {
    key = (await Crypto.getRandomBytesAsync(16)).toString();
    await SecureStoreWrapper.setItem("cipher", key);
  }

  await db.execAsync(`
    PRAGMA key = '${key}';
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY NOT NULL,
      service TEXT,
      account TEXT NOT NULL,
      icon TEXT,
      otp_type TEXT NOT NULL,
      secret TEXT NOT NULL,
      digits INTEGER NOT NULL,
      algorithm TEXT NOT NULL,
      group_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      twofaccounts_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS pending (
      id INTEGER PRIMARY KEY NOT NULL,
      action INTEGER NOT NULL,
      FOREIGN KEY(id) REFERENCES accounts(id)
    );

    INSERT OR IGNORE INTO config VALUES ('includedGroups', '[]');
    INSERT OR IGNORE INTO config VALUES ('excludedGroups', '[]');

    INSERT OR IGNORE INTO config VALUES ('useBiometrics', '0');

    INSERT OR IGNORE INTO config VALUES ('showOtpCode', '1');
  `);
}

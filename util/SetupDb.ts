import * as Crypto from "expo-crypto";
import { type SQLiteDatabase } from "expo-sqlite"
import SecureStoreWrapper from "./SecureStoreWrapper";

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
  `);
}

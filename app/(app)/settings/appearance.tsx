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

import type { BinaryDbResult } from "@/util/SetupDb";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, List, Switch } from "react-native-paper";

const Appearance = () => {
  const [localDataReady, setLocalDataReady] = useState(false);
  const [showOtpCode, setShowOtpCode] = useState(false);
  const toggleShowOtpCode = () => {
    TouchVib();
    setShowOtpCode(current => !current);
  };

  const db = useSQLiteContext();

  useEffect(() => {
    async function config() {
      const showOtpCodeLocal = await db.getFirstAsync<BinaryDbResult>(
        "SELECT value FROM config WHERE key = 'showOtpCode'"
      );
      setShowOtpCode(showOtpCodeLocal?.value === "1");

      setLocalDataReady(true);
    }

    config();
  }, []);

  useEffect(() => {
    if (!localDataReady) {
      return;
    }

    async function update() {
      const updateShowOtpCode = await db.prepareAsync(
        "UPDATE config SET value = $value WHERE key = 'showOtpCode'"
      );

      try {
        await updateShowOtpCode.executeAsync({
          $value: showOtpCode ? "1" : "0"
        });
      } finally {
        await updateShowOtpCode.finalizeAsync();
      }
    }

    update();
  }, [showOtpCode, localDataReady]);

  const showOtpCodeSwitch = () => (
    <Switch value={showOtpCode} onValueChange={toggleShowOtpCode} />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Appearance" />

        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
      </Appbar.Header>

      <ScrollView>
        <List.Item
          title="Show OTP Code"
          description="Show or hide the OTP code when initally viewing the account"
          onPress={toggleShowOtpCode}
          right={showOtpCodeSwitch}
        />
      </ScrollView>
    </>
  );
};

export default Appearance;

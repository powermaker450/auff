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

import { UseBiometricsResult } from "@/util/SetupDb";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, List, Switch } from "react-native-paper";
import * as LocalAuthentication from "expo-local-authentication";

interface SecurityStyleSheet {
  icon: StyleProp<(typeof List)["Icon"]>;
}

const Security = () => {
  const db = useSQLiteContext();
  const [localDataReady, setLocalDataReady] = useState(false);
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [biometricsDisabled, setBiometricsDisabled] = useState(true);
  const [biometricsDesc, setBiometricsDesc] = useState(
    "Secure the app using your device biometrics option"
  );
  const toggleUseBiometrics = () => {
    TouchVib();
    setUseBiometrics(current => !current);
  };

  useEffect(() => {
    async function config() {
      const useBiometricsLocal = await db.getFirstAsync<UseBiometricsResult>(
        "SELECT value FROM config WHERE key = 'useBiometrics'"
      );
      const res = useBiometricsLocal?.value === "1" ? true : false;
      setUseBiometrics(res);
      setAlreadyEnabled(res);

      setLocalDataReady(true);

      return res;
    }

    async function checkHardware() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isSetup = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware) {
        setBiometricsDesc(
          "Your device does not have any biometric capabilites"
        );
        return;
      }

      setBiometricsDisabled(false);
      !isSetup &&
        setBiometricsDesc(
          "You have not setup any biometric authentication on your device"
        );
    }

    config();
    checkHardware();
  }, []);

  useEffect(() => {
    if (!localDataReady) {
      return;
    }

    async function update() {
      if (useBiometrics) {
        const res = await LocalAuthentication.authenticateAsync();

        if (!res.success) {
          alreadyEnabled ? router.back() : setUseBiometrics(false);
          return;
        }
      }

      const updateUseBiometrics = await db.prepareAsync(
        "UPDATE config SET value = $value WHERE key = 'useBiometrics'"
      );

      try {
        await updateUseBiometrics.executeAsync({
          $value: useBiometrics ? 1 : 0
        });
      } finally {
        await updateUseBiometrics.finalizeAsync();
      }
    }

    update();
  }, [useBiometrics, localDataReady]);

  const styles: SecurityStyleSheet = {
    icon: {
      marginLeft: 15
    }
  };

  const useBiometricsIcon = () => (
    <List.Icon style={styles.icon} icon="fingerprint" />
  );

  const useBiometricsSwitch = () => (
    <Switch
      value={useBiometrics}
      onValueChange={toggleUseBiometrics}
      disabled={biometricsDisabled}
    />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Security" />

        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
      </Appbar.Header>

      <ScrollView>
        <List.Item
          title="Use biometrics"
          description={biometricsDesc}
          left={useBiometricsIcon}
          right={useBiometricsSwitch}
          onPress={toggleUseBiometrics}
          disabled={biometricsDisabled}
        />
      </ScrollView>
    </>
  );
};

export default Security;

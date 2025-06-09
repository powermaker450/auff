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

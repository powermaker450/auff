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

import MainView from "@/components/MainView";
import { useApi } from "@/contexts/ApiProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { Redirect, Stack } from "expo-router";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { MD3DarkTheme, MD3LightTheme, Text } from "react-native-paper";

const AppLayout = () => {
  const { loggedIn, loading } = useApi();
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme = useMemo(
    () =>
      colorScheme === "dark"
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );

  if (loading) {
    return (
      <MainView>
        <Text variant="bodyLarge">Loading...</Text>
      </MainView>
    );
  }

  if (!loggedIn) {
    return <Redirect href="/login" />;
  }

  const styles = {
    stack: {
      headerShown: false,
      contentStyle: {
        backgroundColor: paperTheme.colors.background
      }
    }
  };

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <Stack screenOptions={styles.stack} />
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default AppLayout;

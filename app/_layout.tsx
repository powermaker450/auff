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

import { SQLiteProvider } from "expo-sqlite";
import { useColorScheme, View } from "react-native";
import { Stack } from "expo-router";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { ComponentProps, useMemo } from "react";
import { ApiProvider } from "@/contexts/ApiProvider";
import SetupDb from "@/util/SetupDb";
import { ToastProvider } from "@/contexts/ToastProvider";
import { OtpProvider } from "@/contexts/OtpProvider";
import { StyleProp } from "@/util/StyleProp";
import { SecurityProvider } from "@/contexts/SecurityProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme = useMemo(
    () =>
      colorScheme === "dark"
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );

  const styles: {
    view: StyleProp<typeof View>;
    stack: ComponentProps<typeof Stack>["screenOptions"];
  } = {
    view: {
      flex: 1,
      backgroundColor: paperTheme.colors.background
    },
    stack: {
      animation: "fade",
      headerShown: false,
      contentStyle: {
        backgroundColor: paperTheme.colors.background
      }
    }
  };

  return (
    <PaperProvider theme={paperTheme}>
      <SQLiteProvider databaseName="data.db" onInit={SetupDb}>
        <ToastProvider>
          <ApiProvider>
            <OtpProvider>
              <SecurityProvider>
                <View style={styles.view}>
                  <Stack screenOptions={styles.stack} />
                </View>
              </SecurityProvider>
            </OtpProvider>
          </ApiProvider>
        </ToastProvider>
      </SQLiteProvider>
    </PaperProvider>
  );
}

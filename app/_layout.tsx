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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme = useMemo(
    () => colorScheme === "dark" ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );

  const styles: { view: StyleProp<typeof View>, stack: ComponentProps<typeof Stack>["screenOptions"] } = {
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
                <View style={styles.view}>
                  <Stack screenOptions={styles.stack} />
                </View>
            </OtpProvider>
          </ApiProvider>
        </ToastProvider>
      </SQLiteProvider>
    </PaperProvider>
  )
}

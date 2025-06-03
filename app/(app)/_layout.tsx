import MainView from "@/components/MainView";
import { useApi } from "@/contexts/ApiProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { Redirect, Stack } from "expo-router";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, MD3LightTheme, Text } from "react-native-paper";

const AppLayout = () => {
  const { loggedIn, loading } = useApi();
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme = useMemo(
    () => colorScheme === "dark" ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );
  
  if (loading) {
    return (
      <MainView>
        <Text variant="bodyLarge">Loading...</Text>
      </MainView>
    )
  }

  if (!loggedIn) {
    return <Redirect href="/login" />
  }

  const styles = {
    stack: {
      headerShown: false,
      contentStyle: {
        backgroundColor: paperTheme.colors.background
      }
    }
  }

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <Stack screenOptions={styles.stack} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default AppLayout;

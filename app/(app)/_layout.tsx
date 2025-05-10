import { useApi } from "@/contexts/ApiProvider";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { Redirect, Stack } from "expo-router";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
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
    return <Text>Drying up all the rain...</Text>
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

  return <Stack screenOptions={styles.stack} />;
}

export default AppLayout;

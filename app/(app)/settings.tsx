import MainView from "@/components/MainView";
import { useApi } from "@/contexts/ApiProvider";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Appbar, Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import * as Application from "expo-application";
import { StyleProp } from "@/util/StyleProp";

const Settings = () => {
  const { logout } = useApi();
  const theme = useTheme();
  const [dialog, setDialog] = useState(false);
  const showDialog = () => setDialog(true);
  const hideDialog = () => setDialog(false);

  const styles: {
    about: StyleProp<typeof View>;
    aboutTitle: StyleProp<typeof Text>;
    aboutSubtitle: StyleProp<typeof Text>;
    aboutCode: StyleProp<typeof Text>;
    aboutDescription: StyleProp<typeof Text>;
  } = {
    about: {
      width: "50%",
      marginBottom: 25,
      alignItems: "center"
    },
    aboutTitle: {
      fontWeight: "bold"
    },
    aboutSubtitle: {
      color: useMemo(() => theme.colors.onSurfaceDisabled, [theme])
    },
    aboutCode: {
      color: useMemo(() => theme.colors.primary, [theme]),
      fontWeight: "bold"
    },
    aboutDescription: {
      marginTop: 25,
      textAlign: "center"
    }
  };

  const execLogout = () => {
    logout();
    router.replace("/login");
  }

  const aboutText = (
    <View style={styles.about}>
      <Text
        variant="headlineLarge"
        style={styles.aboutTitle}
      >
        {Application.applicationName}
      </Text>

      <Text
        variant="titleMedium"
        style={styles.aboutSubtitle}
      >
        {Application.applicationId}
      </Text>

      <Text variant="titleMedium">
        Version: <Text style={styles.aboutCode}>{Application.nativeApplicationVersion}</Text>
      </Text>

      <Text variant="titleMedium">
        Build: <Text style={styles.aboutCode}>{Application.nativeBuildVersion}</Text>
      </Text>

      <Text
        variant="titleSmall"
        style={styles.aboutDescription}
      >
        A mobile client for 2FAuth with support for offline sync
      </Text>
    </View>
  );

  const logoutDialog = (
    <Portal>
      <Dialog visible={dialog} onDismiss={hideDialog}>
        <Dialog.Title>Log out</Dialog.Title>

        <Dialog.Content>
          <Text>Are you sure you want to log out?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPressIn={TouchVib}
            onPress={hideDialog}
          >
            Cancel
          </Button>

          <Button
            onPressIn={TouchVib}
            onPress={execLogout}
          >
            Logout
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <MainView>
        {aboutText}

        <Button
          mode="contained"
          onPressIn={TouchVib}
          onPress={showDialog}
        >
          Logout
        </Button>
      </MainView>

      {logoutDialog}
    </>
  );
}

export default Settings;

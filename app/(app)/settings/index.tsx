import MainView from "@/components/MainView";
import PagePreview, { PagePreviewProps } from "@/components/PagePreview";
import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import {
  Appbar,
  Button,
  Dialog,
  Portal,
  Text,
  useTheme
} from "react-native-paper";

interface SettingsStyleSheet {
  button: StyleProp<typeof Button>;
}

const Settings = () => {
  const theme = useTheme();
  const { logout } = useApi();

  const [logoutVisible, setLogoutVisible] = useState(false);
  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  const styles = useMemo<SettingsStyleSheet>(
    () => ({
      button: {
        marginTop: 10
      }
    }),
    [theme]
  );

  const pages: PagePreviewProps[] = [
    {
      title: "Appearance",
      icon: "palette",
      navigateTo: "/settings/appearance"
    },
    {
      title: "About",
      icon: "information",
      navigateTo: "/settings/about"
    }
  ];

  const execLogout = () => {
    logout();
    router.replace("/login");
  };

  const logoutDialog = (
    <Portal>
      <Dialog visible={logoutVisible} onDismiss={hideLogoutDialog}>
        <Dialog.Title>Log out</Dialog.Title>

        <Dialog.Content>
          <Text>Are you sure you want to log out?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPressIn={TouchVib} onPress={hideLogoutDialog}>
            Cancel
          </Button>

          <Button onPressIn={TouchVib} onPress={execLogout}>
            Log out
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Settings" />

        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
      </Appbar.Header>

      <ScrollView>
        {pages.map((page, index) => (
          <PagePreview
            key={index}
            title={page.title}
            icon={page.icon}
            navigateTo={page.navigateTo}
          />
        ))}

        <MainView>
          <Button
            style={styles.button}
            mode="contained"
            onPressIn={TouchVib}
            onPress={showLogoutDialog}
          >
            Log out
          </Button>
        </MainView>
      </ScrollView>

      {logoutDialog}
    </>
  );
};

export default Settings;

import MainView from "@/components/MainView";
import { useApi } from "@/contexts/ApiProvider";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useState } from "react";
import { Appbar, Button, Dialog, Portal, Text } from "react-native-paper";

const Settings = () => {
  const { logout } = useApi();
  const [dialog, setDialog] = useState(false);
  const showDialog = () => setDialog(true);
  const hideDialog = () => setDialog(false);

  const execLogout = () => {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <MainView>
        <Button
          mode="contained"
          onPressIn={TouchVib}
          onPress={showDialog}
        >
          Logout
        </Button>
      </MainView>

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
    </>
  );
}

export default Settings;

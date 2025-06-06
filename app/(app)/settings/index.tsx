import MainView from "@/components/MainView";
import PagePreview, { PagePreviewProps } from "@/components/PagePreview";
import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, Button, useTheme } from "react-native-paper";

interface SettingsStyleSheet {
  button: StyleProp<typeof Button>;
}

const Settings = () => {
  const theme = useTheme();
  const { logout } = useApi();

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
      title: "Security",
      icon: "lock",
      navigateTo: "/settings/security"
    },
    {
      title: "About",
      icon: "information",
      navigateTo: "/settings/about"
    }
  ];

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
            onPress={logout}
          >
            Log out
          </Button>
        </MainView>
      </ScrollView>
    </>
  );
};

export default Settings;

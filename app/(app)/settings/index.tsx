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
import PagePreview, { PagePreviewProps } from "@/components/PagePreview";
import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, Button } from "react-native-paper";

interface SettingsStyleSheet {
  button: StyleProp<typeof Button>;
}

const Settings = () => {
  const { logout } = useApi();

  const styles: SettingsStyleSheet = {
    button: {
      marginTop: 10
    }
  };

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

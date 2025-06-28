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
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useMemo } from "react";
import { Linking, View } from "react-native";
import { Appbar, Button, Text, useTheme } from "react-native-paper";
import * as Application from "expo-application";
import { StyleProp } from "@/util/StyleProp";

interface AboutStyleSheet {
  about: StyleProp<typeof View>;
  aboutTitle: StyleProp<typeof Text>;
  aboutSubtitle: StyleProp<typeof Text>;
  aboutCode: StyleProp<typeof Text>;
  aboutDescription: StyleProp<typeof Text>;
}

const About = () => {
  const theme = useTheme();

  const styles = useMemo<AboutStyleSheet>(
    () => ({
      about: {
        width: "50%",
        marginBottom: 25,
        alignItems: "center"
      },
      aboutTitle: {
        fontWeight: "bold"
      },
      aboutSubtitle: {
        color: theme.colors.onSurfaceDisabled
      },
      aboutCode: {
        color: theme.colors.primary,
        fontWeight: "bold"
      },
      aboutDescription: {
        marginTop: 25,
        textAlign: "center"
      }
    }),
    [theme]
  );

  const aboutText = (
    <View style={styles.about}>
      <Text variant="headlineLarge" style={styles.aboutTitle}>
        {Application.applicationName}
      </Text>

      <Text variant="titleMedium" style={styles.aboutSubtitle}>
        {Application.applicationId}
      </Text>

      <Text variant="titleMedium">
        Version:{" "}
        <Text style={styles.aboutCode}>
          {Application.nativeApplicationVersion}
        </Text>
      </Text>

      <Text variant="titleMedium">
        Build:{" "}
        <Text style={styles.aboutCode}>{Application.nativeBuildVersion}</Text>
      </Text>

      <Text variant="titleSmall" style={styles.aboutDescription}>
        A mobile client for 2FAuth with support for offline sync
      </Text>
    </View>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title="About" />
      </Appbar.Header>

      <MainView>
        {aboutText}

        <Button
          onPressIn={TouchVib}
          onPress={() =>
            Linking.openURL("https://github.com/powermaker450/auff")
          }
        >
          Source Code
        </Button>
      </MainView>
    </>
  );
};

export default About;

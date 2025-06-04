import MainView from "@/components/MainView";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";
import * as Application from "expo-application";
import { StyleProp } from "@/util/StyleProp";

const About = () => {
  const theme = useTheme();

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

      <MainView>{aboutText}</MainView>
    </>
  );
};

export default About;

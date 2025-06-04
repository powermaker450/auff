import MainView from "@/components/MainView";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
// import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { router } from "expo-router";
import { Appbar, Text } from "react-native-paper";

interface AppearanceStyleSheet {
  text: StyleProp<typeof Text>;
}

const Appearance = () => {
  // const { updateTheme, resetTheme } = useMaterial3Theme()

  const styles: AppearanceStyleSheet = {
    text: {
      fontWeight: "bold"
    }
  };

  // const enableMaterialYou = () => resetTheme();
  // const disableMaterialYou = () => updateTheme("#664ea3");

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Appearance" />

        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
      </Appbar.Header>

      <MainView>
        <Text style={styles.text} variant="bodyLarge">
          Coming soon...
        </Text>
      </MainView>
    </>
  );
};

export default Appearance;

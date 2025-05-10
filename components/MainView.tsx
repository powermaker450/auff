import { StyleProp } from "@/util/StyleProp";
import { ReactNode } from "react";
import { View } from "react-native";

interface MainViewProps {
  children?: ReactNode;
}

const MainView = ({ children }: MainViewProps) => {
  const styles: { view: StyleProp<typeof View> } = {
    view: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }
  }

  return <View style={styles.view}>{children}</View>
}

export default MainView;

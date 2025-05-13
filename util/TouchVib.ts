import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export default function TouchVib(): void {
  Platform.OS === "android"
    ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click)
    : Haptics.impactAsync();
}

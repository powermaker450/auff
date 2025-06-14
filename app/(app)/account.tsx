import MainView from "@/components/MainView";
import { useOtp } from "@/contexts/OtpProvider";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Appbar,
  IconButton,
  ProgressBar,
  Surface,
  Text,
  Tooltip,
  useTheme
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useToast } from "@/contexts/ToastProvider";
import { Image } from "expo-image";
import { useSQLiteContext } from "expo-sqlite";
import { BinaryDbResult } from "@/util/SetupDb";

const Account = () => {
  const db = useSQLiteContext();
  const otp = useOtp();
  const toast = useToast();
  const navigation = useNavigation();
  const theme = useTheme();

  const [showOtpCode, setShowOtpCode] = useState(false);
  const toggleShowOtpCode = () => setShowOtpCode(current => !current);

  useEffect(() => {
    navigation.addListener("beforeRemove", otp.clearAccount);

    async function config() {
      const showOtpCodeLocal = await db.getFirstAsync<BinaryDbResult>(
        "SELECT value FROM config WHERE key = 'showOtpCode'"
      );
      setShowOtpCode(showOtpCodeLocal?.value === "1");
    }

    config();
  }, []);

  const styles: {
    view: StyleProp<typeof Surface>;
    title: StyleProp<typeof Text>;
    code: StyleProp<typeof Text>;
    progressBar: StyleProp<typeof ProgressBar>;
    icon: StyleProp<typeof Image>;
  } = {
    view: {
      height: "50%",
      width: "95%",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center"
    },
    title: {
      fontWeight: "bold"
    },
    code: {
      fontWeight: "bold",
      color: theme.colors.primary
    },
    progressBar: {
      height: 10,
      width: 300,
      marginTop: 15,
      marginBottom: 15
    },
    icon: {
      width: "25%",
      height: "40%"
    }
  };

  const progress = +((otp.remainingTime ?? 0) / (otp.maxTime ?? 30));
  let formattedCode =
    otp.code?.substring(0, otp.code.length / 2) +
    " " +
    otp.code?.substring(otp.code.length / 2);

  if (!showOtpCode) {
    formattedCode = formattedCode.replaceAll(/\d/g, "*");
  }

  const copy = async () => {
    if (!otp.code) {
      return;
    }

    try {
      await Clipboard.setStringAsync(otp.code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    await Clipboard.setStringAsync(otp.code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const icon = otp.icon?.endsWith("noicon.svg") ? undefined : (
    <Image source={otp.icon} style={styles.icon} />
  );

  const otpView = (
    <Surface style={styles.view} elevation={5}>
      {icon}
      <Text style={styles.title} variant="headlineLarge">
        {otp.serviceName}
      </Text>

      <Text variant="headlineSmall">{otp.accountName}</Text>

      <ProgressBar style={styles.progressBar} progress={progress} />

      <Text style={styles.code} variant="titleLarge" onPress={copy}>
        {formattedCode}
      </Text>

      <Tooltip title={showOtpCode ? "Hide OTP" : "Show OTP"}>
        <IconButton
          icon={showOtpCode ? "eye-off" : "eye"}
          size={32}
          onPressIn={TouchVib}
          onPress={toggleShowOtpCode}
        />
      </Tooltip>
    </Surface>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title={otp.serviceName} />
      </Appbar.Header>

      <MainView>{otpView}</MainView>
    </>
  );
};

export default Account;

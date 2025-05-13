import MainView from "@/components/MainView";
import { useOtp } from "@/contexts/OtpProvider";
import { StyleProp } from "@/util/StyleProp";
import { Header } from "@react-navigation/elements";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo } from "react";
import { Appbar, ProgressBar, Surface, Text, useTheme } from "react-native-paper";

const Account = () => {
  const otp = useOtp();
  const navigation = useNavigation();
  const theme = useTheme();

  useEffect(() => navigation.addListener("beforeRemove", otp.clearAccount), []);

  const styles: {
    view: StyleProp<typeof Surface>;
    title: StyleProp<typeof Text>;
    code: StyleProp<typeof Text>;
    progressBar: StyleProp<typeof ProgressBar>;
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
      color: theme.colors.primary,
      marginBottom: 15
    },
    progressBar: {
      height: 10,
      width: 300,
    }
  };

  const progress = +(
    (otp.remainingTime ?? 0) / (otp.maxTime ?? 30)
  );

  const formattedCode = otp.code?.substring(0, otp.code.length / 2) + " " + otp.code?.substring(otp.code.length / 2);

  const otpView = (
    <Surface
      style={styles.view}
      elevation={5}
    >
      <Text style={styles.title} variant="headlineLarge">{otp.serviceName}</Text>
      <Text style={{ marginBottom: 30 }} variant="headlineSmall">{otp.accountName}</Text>

      <Text style={styles.code} variant="titleLarge">{formattedCode}</Text>
      <ProgressBar
      style={styles.progressBar}
        progress={progress}
      />
    </Surface>
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={router.back} />
        <Appbar.Content title={otp.serviceName} />
      </Appbar.Header>

      <MainView>
        {otpView}
      </MainView>
    </>
  )
}

export default Account;

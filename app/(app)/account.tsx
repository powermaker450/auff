import MainView from "@/components/MainView";
import { useOtp } from "@/contexts/OtpProvider";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Surface, Text } from "react-native-paper";

const Account = () => {
  const otp = useOtp();
  const navigation = useNavigation();
  useEffect(() => navigation.addListener("beforeRemove", otp.clearAccount), []);

  return (
    <MainView>
      {otp.code && (
        <Surface elevation={5}>
          <Text>{otp.code}</Text>
          <Text>{otp.remainingTime}</Text>
        </Surface>
      )}
    </MainView>
  )
}

export default Account;

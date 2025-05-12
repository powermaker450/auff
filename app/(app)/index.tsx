import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import { TwoFAccount } from "@povario/2fauth.js";
import { ComponentProps, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Appbar, List, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNetworkState } from "expo-network";
import { useOtp } from "@/contexts/OtpProvider";
import { router } from "expo-router";

const Index = () => {
  const db = useSQLiteContext();
  const network = useNetworkState();
  const theme = useTheme();
  const otp = useOtp();
  const { api, baseUrl } = useApi();
  const { bottom } = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<TwoFAccount<boolean>[]>([]);

  useEffect(() => {
    async function getData() {
      const accountTable = await db.prepareAsync(`
        INSERT INTO accounts VALUES ($id, $service, $account, $icon, $otp_type, $secret, $digits, $algorithm, $group_id)
        ON CONFLICT(id) DO UPDATE SET
          icon = $icon,
          otp_type = $otp_type,
          secret = $secret,
          digits = $digits,
          algorithm = $algorithm,
          group_id = $group_id
      `);
      const result = await db.getAllAsync<TwoFAccount<true>>("SELECT * FROM accounts");

      if (!network.isInternetReachable) {
        await accountTable.finalizeAsync();
        setAccounts(result);
        return;
      }

      const net = await api.accounts.getAll<true>(true);
      setAccounts(net);

      try {
        for (const acc of net) {
          await accountTable.executeAsync({
            $id: acc.id,
            $service: acc.service,
            $account: acc.account,
            $icon: acc.icon,
            $otp_type: acc.otp_type,
            $secret: acc.secret,
            $digits: acc.digits,
            $algorithm: acc.algorithm,
            $group_id: acc.group_id
          });
        }
      } finally {
        console.log("DB done!")
        await accountTable.finalizeAsync();
      }
    }

    getData()
      .catch(console.error)
  }, [network]);

  const styles: {
    account: StyleProp<typeof List["Item"]>;
    view: StyleProp<typeof View>;
    title: ComponentProps<typeof List["Item"]>["titleStyle"];
    icon: StyleProp<typeof Image>;
  } = {
    account: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 20,
      marginTop: 7,
      marginBottom: 7,
      width: "95%",
      alignSelf: "center"
    },
    view: {
      width: "100%",
      marginBottom: bottom * 7,
    },
    title: {
      fontWeight: "bold"
    },
    icon: {
      marginLeft: 15,
      width: "10%",
      height: "100%"
    }
  }

  const mapAccount = (account: TwoFAccount) => {
    const icon = () => (
      <Image
        source={baseUrl + `/storage/icons/${account.icon ?? "noicon.svg"}`}
        style={styles.icon}
      />
    );

    const openOtp = () => {
      otp.setAccount(account.id!);
      router.navigate("/account");
    }

    return (
      <List.Item
        style={styles.account}
        key={account.id}
        title={account.service ?? "[No Name]"}
        description={account.account}
        titleStyle={styles.title}
        left={icon}
        onPress={openOtp}
      />
    );
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Accounts" />
      </Appbar.Header>


    <View
      style={styles.view}
    >
      <ScrollView>
        {accounts.map(mapAccount)}
      </ScrollView>
    </View>
    </>
  )
}

export default Index;

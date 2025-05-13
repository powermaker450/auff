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
import TouchVib from "@/util/TouchVib";

const Index = () => {
  const db = useSQLiteContext();
  const network = useNetworkState();
  const theme = useTheme();
  const otp = useOtp();
  const { api, baseUrl } = useApi();
  const { bottom } = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<TwoFAccount<boolean>[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function getData() {
    setRefreshing(true);

    const localAccounts = await db.getAllAsync<TwoFAccount<true>>("SELECT * FROM accounts");
    
    // If we are offline, just show all the accounts in the local DB
    if (!network.isInternetReachable) {
      setAccounts(localAccounts);
      return;
    }

    // Prepared statements
    const insertAccount = await db.prepareAsync(`
      INSERT INTO accounts VALUES ($id, $service, $account, $icon, $otp_type, $secret, $digits, $algorithm, $group_id)
      ON CONFLICT(id) DO UPDATE SET
        icon = $icon,
        otp_type = $otp_type,
        secret = $secret,
        digits = $digits,
        algorithm = $algorithm,
        group_id = $group_id
    `);
    const deleteAccount = await db.prepareAsync("DELETE FROM accounts WHERE id = $id");

    // Get and set server accounts
    const serverAccounts = await api.accounts.getAll<true>(true);
    setAccounts(serverAccounts);

    // Check if any server accounts have been deleted and sync that to the local DB
    try {
      const localIds = localAccounts.map(account => account.id);
      const serverIds = serverAccounts.map(account => account.id);

      for (const $id of localIds) {
        !serverIds.includes($id) && await deleteAccount.executeAsync({ $id });
      }
    } finally {
      await deleteAccount.finalizeAsync();
    }

    // Update/insert all accounts from the server side into the local DB
    try {
      for (const acc of serverAccounts) {
        await insertAccount.executeAsync({
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
      await insertAccount.finalizeAsync();
    }

    setRefreshing(false);
  };
  
  useEffect(() => {
    getData();
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
        <Appbar.Action
          icon="refresh"
          onPressIn={TouchVib}
          onPress={getData}
          disabled={!network.isInternetReachable || refreshing}
        />
        <Appbar.Action
          icon="cog"
          onPressIn={TouchVib}
          onPress={() => router.navigate("/settings")}
        />
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

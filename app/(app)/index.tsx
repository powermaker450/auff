import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import { Account } from "@povario/2fauth.js";
import { ComponentProps, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Appbar, List, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/contexts/ToastProvider";

const Index = () => {
  const theme = useTheme();
  const { api, baseUrl } = useApi();
  const { bottom } = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const getData = async () => setAccounts(await api.accounts.getAll());
    getData();
  }, []);

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
      marginBottom: bottom,
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

  const mapAccount = (account: Account) => {
    const icon = () => (
      <Image
        source={baseUrl + `/storage/icons/${account.icon ?? "noicon.svg"}`}
        style={styles.icon}
      />
    )

    return (
      <List.Item
        style={styles.account}
        key={account.id}
        title={account.service ?? "[No Name]"}
        description={account.account}
        titleStyle={styles.title}
        left={icon}
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

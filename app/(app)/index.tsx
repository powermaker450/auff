import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import { Group, TwoFAccount } from "@povario/2fauth.js";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, List, Modal, Portal, Tooltip, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNetworkState } from "expo-network";
import { useOtp } from "@/contexts/OtpProvider";
import { router } from "expo-router";
import TouchVib from "@/util/TouchVib";
import { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FilterSheet from "@/components/FilterSheet";

const Index = () => {
  const db = useSQLiteContext();
  const toast = useToast();
  const network = useNetworkState();
  const theme = useTheme();
  const otp = useOtp();

  const { api, baseUrl, logout } = useApi();
  const { bottom } = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<TwoFAccount<boolean>[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [sheetModal, setSheetModal] = useState(false);
  const sheet = useRef<BottomSheetModal>(null);
  const handleSheetAnimate = (_: number, to: number) => to === -1 && setSheetModal(false);

  const openSheet = () => {
    setSheetModal(true);
    sheet.current?.present();
  };
  const closeSheet = () => {
    setSheetModal(false);
    sheet.current?.close();
  };

  async function getData() {
    setRefreshing(true);

    const localGroups = await db.getAllAsync<Group>("SELECT * FROM groups");
    const localAccounts = await db.getAllAsync<TwoFAccount<true>>("SELECT * FROM accounts");
    
    // If we are offline, just use the data in the local DB
    if (!network.isInternetReachable) {
      setAccounts(localAccounts);
      setGroups(localGroups);
      setRefreshing(false);
      return;
    }

    // ---
    // Fetching and setting accounts
    // ---

    // Prepared statements
    const insertAccount = await db.prepareAsync(`
      INSERT INTO accounts VALUES ($id, $service, $account, $icon, $otp_type, $secret, $digits, $algorithm, $group_id)
      ON CONFLICT(id) DO UPDATE SET
        service = $service,
        account = $account,
        icon = $icon,
        otp_type = $otp_type,
        secret = $secret,
        digits = $digits,
        algorithm = $algorithm,
        group_id = $group_id
    `);
    const deleteAccount = await db.prepareAsync("DELETE FROM accounts WHERE id = $id");

    // Get and set server accounts
    let serverAccounts: TwoFAccount<true>[];

    try {
      serverAccounts = await api.accounts.getAll<true>(true);
      setAccounts(serverAccounts);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.message);

        // This was, for some reason, a string
        err.status == 401 && logout();
      }

      return;
    } finally {
      setRefreshing(false);
    }

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

    // ---
    // Fetching and setting groups
    // ---

    // Prepared statements

    const insertGroup = await db.prepareAsync(`
      INSERT INTO groups VALUES ($id, $name, $twofaccounts_count)
      ON CONFLICT(id) DO UPDATE SET
        id = $id,
        name = $name,
        twofaccounts_count = $twofaccounts_count
    `);

    const deleteGroup = await db.prepareAsync(`DELETE FROM groups WHERE id = $id`);

    let serverGroups: Group[];
    try {
      serverGroups = await api.groups.getAll();
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.message);

        // This was, for some reason, a string
        err.status == 401 && logout();
      }

      return;
    }

    // Check if any groups have been deleted and sync that to the local DB
    try {
      const localGroupIds = localGroups.map(group => group.id);
      const serverGroupIds = serverGroups.map(group => group.id);

      for (const $id of localGroupIds) {
        !serverGroupIds.includes($id) && await deleteGroup.executeAsync({ $id });
      }
    } finally {
      await deleteGroup.finalizeAsync();
    }

    // Insert all server groups into the DB
    try {
      for (const group of serverGroups) {
        await insertGroup.executeAsync({
          $id: group.id,
          $name: group.name,
          $twofaccounts_count: group.twofaccounts_count
        });
      }
    } finally {
      await insertGroup.finalizeAsync();
    }

    setRefreshing(false);
  };

  useEffect(() => {
    getData().catch(console.error);
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

  useEffect(() => console.log(selectedGroups), [selectedGroups]);

  const loading = <ActivityIndicator animating={refreshing} />;
  const accountList = accounts.length === 0
    ? loading
    : selectedGroups.length === 0
      ? accounts.map(mapAccount)
      : accounts.map(account => selectedGroups.includes(account.group_id ?? 0) ? mapAccount(account) : undefined);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Accounts" />

        <Tooltip title="Filters">
          <Appbar.Action
            icon="filter-variant"
            onPressIn={TouchVib}
            onPress={openSheet}
          />
        </Tooltip>

        <Tooltip title={network.isInternetReachable ? "Refresh" : "Refresh (unavailable when offline)"}>
          <Appbar.Action
            icon="refresh"
            onPressIn={TouchVib}
            onPress={getData}
            onLongPress={TouchVib}
            disabled={!network.isInternetReachable || refreshing}
          />
        </Tooltip>

        <Tooltip title="Settings">
          <Appbar.Action
            icon="cog"
            onPressIn={TouchVib}
            onPress={() => router.navigate("/settings")}
            onLongPress={TouchVib}
          />
        </Tooltip>
      </Appbar.Header>


      <View
        style={styles.view}
      >
        <ScrollView>
          {accountList}
        </ScrollView>
      </View>

      {/* Putting the filter sheet inside the modal doesn't work for some reason... */}
      <FilterSheet ref={sheet} onAnimate={handleSheetAnimate} />
      <Modal visible={sheetModal} onDismiss={closeSheet}>
        <></>
      </Modal>
    </>
  )
}

export default Index;

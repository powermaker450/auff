/*
 * auff: A mobile client for 2FAuth
 * Copyright (C) 2025  povario
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import { Group, TwoFAccount } from "@povario/2fauth.js";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  FAB,
  List,
  Modal,
  Searchbar,
  Text,
  Tooltip
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNetworkState } from "expo-network";
import { router } from "expo-router";
import TouchVib from "@/util/TouchVib";
import { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FilterSheet from "@/components/FilterSheet";
import AccountPreview from "@/components/AccountPreview";
import GroupSelect from "@/components/GroupSelect";
import { PendingReason, PendingResult } from "@/util/SetupDb";

type ValueResult = { value: string };

interface IndexStyleSheet {
  view: StyleProp<typeof View>;
  title: ComponentProps<(typeof List)["Item"]>["titleStyle"];
  searchBar: StyleProp<typeof Searchbar>;
  fab: ComponentProps<typeof FAB>["style"];
}

const Index = () => {
  const db = useSQLiteContext();
  const toast = useToast();
  const network = useNetworkState();

  const { api, logout } = useApi();
  const { bottom } = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<TwoFAccount<boolean>[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [includedGroups, setIncludedGroups] = useState<number[]>([]);
  const [excludedGroups, setExcludedGroups] = useState<number[]>([]);
  const [localGroupsReady, setLocalGroupsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [fabGroupState, setFabGroupState] = useState({ open: false });
  const onFabStateChange = (state: { open: boolean }) => {
    TouchVib();
    setFabGroupState(state);
  };

  const toggleIncluded = useCallback(
    (groupId: number) => {
      const filterWithoutTarget = (array: number[]) =>
        array.filter(value => value !== groupId);

      if (includedGroups.includes(groupId)) {
        setIncludedGroups(filterWithoutTarget);
        return;
      }

      setIncludedGroups(current => current.concat([groupId]));
      setExcludedGroups(filterWithoutTarget);
    },
    [includedGroups, excludedGroups]
  );

  const toggleExcluded = useCallback(
    (groupId: number) => {
      const filterWithoutTarget = (array: number[]) =>
        array.filter(value => value !== groupId);

      if (excludedGroups.includes(groupId)) {
        setExcludedGroups(filterWithoutTarget);
        return;
      }

      setExcludedGroups(current => current.concat([groupId]));
      setIncludedGroups(filterWithoutTarget);
    },
    [includedGroups, excludedGroups]
  );

  const [sheetModal, setSheetModal] = useState(false);
  const sheet = useRef<BottomSheetModal>(null);
  const handleSheetAnimate = (_: number, to: number) =>
    to === -1 && setSheetModal(false);

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
    const localAccounts = await db.getAllAsync<TwoFAccount<true>>(
      "SELECT * FROM accounts"
    );
    const pendingAccounts = await db.getAllAsync<PendingResult>(
      "SELECT * FROM pending"
    );

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
    const deleteAccount = await db.prepareAsync(
      "DELETE FROM accounts WHERE id = $id"
    );

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
    // Additionally, if a local account is pending creation, don't delete it because that would be bad
    try {
      const localIds = localAccounts.map(account => account.id);
      const serverIds = serverAccounts.map(account => account.id);

      for (const $id of localIds) {
        if (
          pendingAccounts.findIndex(
            pending =>
              pending.id === $id && pending.action === PendingReason.Create
          ) !== -1
        ) {
          continue;
        }

        !serverIds.includes($id) && (await deleteAccount.executeAsync({ $id }));
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

    const deleteGroup = await db.prepareAsync(
      `DELETE FROM groups WHERE id = $id`
    );

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
        !serverGroupIds.includes($id) &&
          (await deleteGroup.executeAsync({ $id }));
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
  }

  // Get and set group and account data
  useEffect(() => {
    getData().catch(console.error);
  }, [network]);

  // Get selected groups from the local database
  useEffect(() => {
    async function setSelectedGroups() {
      const emptyArray = "[]";
      const localIncludedJson = await db.getFirstAsync<ValueResult>(
        "SELECT value FROM config WHERE key = 'includedGroups'"
      );
      const localExcludedJson = await db.getFirstAsync<ValueResult>(
        "SELECT value FROM config WHERE key = 'excludedGroups'"
      );

      const localIncluded: number[] = JSON.parse(
        localIncludedJson?.value ?? emptyArray
      );
      const localExcluded: number[] = JSON.parse(
        localExcludedJson?.value ?? emptyArray
      );

      localIncluded.length && setIncludedGroups(localIncluded);
      localExcluded.length && setExcludedGroups(localExcluded);

      setLocalGroupsReady(true);
    }

    setSelectedGroups();
  }, []);

  // Update local database with included groups
  useEffect(() => {
    if (!localGroupsReady) {
      return;
    }

    async function update() {
      const updateIncludedGroups = await db.prepareAsync(
        "UPDATE config SET value = $groups WHERE key = 'includedGroups'"
      );

      try {
        await updateIncludedGroups.executeAsync({
          $groups: JSON.stringify(includedGroups)
        });
      } finally {
        await updateIncludedGroups.finalizeAsync();
      }
    }

    update();
  }, [includedGroups, localGroupsReady]);

  // Update local database with excluded groups
  useEffect(() => {
    if (!localGroupsReady) {
      return;
    }

    async function update() {
      const updateExcludedGroups = await db.prepareAsync(
        "UPDATE config SET value = $groups WHERE key = 'excludedGroups'"
      );

      try {
        await updateExcludedGroups.executeAsync({
          $groups: JSON.stringify(excludedGroups)
        });
      } finally {
        await updateExcludedGroups.finalizeAsync();
      }
    }

    update();
  }, [excludedGroups, localGroupsReady]);

  const styles = useMemo<IndexStyleSheet>(
    () => ({
      view: {
        width: "100%",
        marginBottom: bottom * 11
      },
      title: {
        fontWeight: "bold"
      },
      searchBar: {
        width: "95%",
        alignSelf: "center",
        marginBottom: 5
      },
      fab: {
        position: "absolute",
        margin: 24,
        right: 0,
        bottom: 0
      }
    }),
    [bottom]
  );

  const accountList = useMemo(() => {
    if (!accounts.length) {
      return <ActivityIndicator animating={refreshing} />;
    }

    const includedOnly = (account: TwoFAccount) =>
      includedGroups.includes(account.group_id ?? -1) &&
      !excludedGroups.includes(account.group_id ?? -1);
    const removeExcluded = (account: TwoFAccount) =>
      !excludedGroups.includes(account.group_id ?? -1);
    const createAccountPreview = (account: TwoFAccount) => (
      <AccountPreview key={account.id} account={account} refresh={getData} />
    );
    const filterSearched = (account: TwoFAccount) => {
      const text = searchText.trim().toLowerCase();
      return (
        account.account.toLowerCase().includes(text) ||
        account.service?.toLowerCase().includes(text)
      );
    };

    // Filtered accounts based on account groups
    const filtered = accounts.filter(
      includedGroups.length ? includedOnly : removeExcluded
    );

    // If there is search text that has no trailing spaces, filter the accounts by the search query
    return searchText.trim()
      ? filtered.filter(filterSearched).map(createAccountPreview)
      : filtered.map(createAccountPreview);
  }, [accounts, includedGroups, excludedGroups, searchText]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Accounts" />

        {groups.length ? (
          <Tooltip title="Filters">
            <Appbar.Action
              icon="filter-variant"
              onPressIn={TouchVib}
              onPress={openSheet}
            />
          </Tooltip>
        ) : undefined}

        <Tooltip
          title={
            network.isInternetReachable
              ? "Refresh"
              : "Refresh (unavailable when offline)"
          }
        >
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

      <View style={styles.view}>
        <Searchbar
          style={styles.searchBar}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search accounts..."
          onClearIconPress={TouchVib}
        />
        <ScrollView>{accountList}</ScrollView>
      </View>

      <FAB.Group
        open={fabGroupState.open}
        onStateChange={onFabStateChange}
        visible
        icon={fabGroupState.open ? "close" : "plus"}
        actions={[
          {
            label: "Scan QR Code",
            icon: "qrcode",
            onPress: () => router.navigate("/scan")
          },
          {
            label: "Create Account Group",
            icon: "account-multiple-plus",
            onPress: () => toast.error("Not implemented... (yet)")
          },
          {
            label: "Create Account manually",
            icon: "account-plus",
            onPress: () => router.navigate("/create")
          }
        ]}
      />

      <FilterSheet ref={sheet} onAnimate={handleSheetAnimate}>
        <Text variant="labelLarge">Tap to include, long press to exclude</Text>
        {groups
          .filter(group => group.id !== 0)
          .map(group => (
            <GroupSelect
              key={group.id}
              group={group}
              includedGroups={includedGroups}
              excludedGroups={excludedGroups}
              toggleIncluded={toggleIncluded}
              toggleExcluded={toggleExcluded}
            />
          ))}
      </FilterSheet>
      <Modal visible={sheetModal} onDismiss={closeSheet}>
        {/* Modals don't like to be empty... */}
        <></>
      </Modal>
    </>
  );
};

export default Index;

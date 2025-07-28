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
import { useOtp } from "@/contexts/OtpProvider";
import { useToast } from "@/contexts/ToastProvider";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import { TwoFAccount } from "@povario/2fauth.js";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  Button,
  Dialog,
  List,
  Portal,
  Text,
  useTheme
} from "react-native-paper";

interface AccountPreviewProps {
  account: TwoFAccount;
  refresh: () => void;
}

const AccountPreview = ({ account, refresh }: AccountPreviewProps) => {
  const { api } = useApi();
  const toast = useToast();
  const theme = useTheme();
  const otp = useOtp();
  const { baseUrl } = useApi();

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const showDeleteDialog = () => {
    TouchVib();
    setDeleteDialogVisible(true);
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const styles: {
    account: StyleProp<(typeof List)["Item"]>;
    title: ComponentProps<(typeof List)["Item"]>["titleStyle"];
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
    title: {
      fontWeight: "bold"
    },
    icon: {
      marginLeft: 15,
      width: "10%",
      height: "100%"
    }
  };

  async function del() {
    if (!account.id) {
      return;
    }

    startLoading();

    try {
      await api.accounts.delete(account.id);

      refresh();
      toast.show(`${account.service ?? "Account"} deleted.`);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      stopLoading();
    }
  }

  const icon = () =>
    account.icon ? (
      <Image
        source={baseUrl + `/storage/icons/${account.icon}`}
        style={styles.icon}
      />
    ) : (
      <List.Icon icon="account-circle" style={{ marginLeft: 20 }} />
    );

  const openOtp = () => {
    otp.setAccount(account.id!);
    router.navigate("/account");
  };

  return (
    <>
      <List.Item
        style={styles.account}
        key={account.id}
        title={account.service ?? "[No Name]"}
        description={account.account}
        titleStyle={styles.title}
        left={icon}
        onPress={openOtp}
        onLongPress={showDeleteDialog}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title>Delete {account.service ?? "account"}</Dialog.Title>

          <Dialog.Content>
            <Text>Are you sure you want to delete this account?</Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPressIn={TouchVib}
              onPress={hideDeleteDialog}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onPressIn={TouchVib}
              onPress={del}
              textColor={theme.colors.error}
              disabled={loading}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default AccountPreview;

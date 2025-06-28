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
import { StyleProp } from "@/util/StyleProp";
import { TwoFAccount } from "@povario/2fauth.js";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { List, useTheme } from "react-native-paper";

interface AccountPreviewProps {
  account: TwoFAccount;
}

const AccountPreview = ({ account }: AccountPreviewProps) => {
  const theme = useTheme();
  const otp = useOtp();
  const { baseUrl } = useApi();

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
};

export default AccountPreview;

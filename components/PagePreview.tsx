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

import { StyleProp } from "@/util/StyleProp";
import { Href, router } from "expo-router";
import { ComponentProps, useMemo } from "react";
import { List, useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

interface PagePreviewStyleSheet {
  item: StyleProp<(typeof List)["Item"]>;
  icon: StyleProp<(typeof List)["Icon"]>;
}

export interface PagePreviewProps {
  title: ComponentProps<(typeof List)["Item"]>["title"];
  icon: IconSource;
  navigateTo: Href;
}

const PagePreview = ({ title, icon, navigateTo }: PagePreviewProps) => {
  const theme = useTheme();

  const styles = useMemo<PagePreviewStyleSheet>(
    () => ({
      item: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 20,
        marginTop: 7,
        marginBottom: 7,
        width: "95%",
        height: 65,
        alignSelf: "center",
        justifyContent: "center"
      },
      icon: {
        marginLeft: 15
      }
    }),
    [theme]
  );

  const leftIcon = () => <List.Icon style={styles.icon} icon={icon} />;
  const rightIcon = () => <List.Icon icon="chevron-right" />;
  const action = () => router.navigate(navigateTo);

  return (
    <List.Item
      style={styles.item}
      title={title}
      left={leftIcon}
      right={rightIcon}
      onPress={action}
    />
  );
};

export default PagePreview;

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
import { ReactNode } from "react";
import { View } from "react-native";

interface MainViewProps {
  children?: ReactNode;
}

const MainView = ({ children }: MainViewProps) => {
  const styles: { view: StyleProp<typeof View> } = {
    view: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }
  };

  return <View style={styles.view}>{children}</View>;
};

export default MainView;

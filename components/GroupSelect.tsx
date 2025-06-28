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

import TouchVib from "@/util/TouchVib";
import { Group } from "@povario/2fauth.js";
import { useMemo } from "react";
import { Checkbox, List } from "react-native-paper";

type ToggleFunction = (groupId: number) => void;
type CheckboxStatus = "checked" | "unchecked" | "indeterminate";

interface GroupSelectProps {
  group: Group;
  includedGroups: number[];
  excludedGroups: number[];
  toggleIncluded: ToggleFunction;
  toggleExcluded: ToggleFunction;
}

const GroupSelect = ({
  group,
  includedGroups,
  excludedGroups,
  toggleIncluded,
  toggleExcluded
}: GroupSelectProps) => {
  const status = useMemo<CheckboxStatus>(
    () =>
      includedGroups.includes(group.id)
        ? "checked"
        : excludedGroups.includes(group.id)
          ? "indeterminate"
          : "unchecked",
    [includedGroups, excludedGroups]
  );

  const checkBox = () => <Checkbox status={status} />;

  const handlePress = () => {
    TouchVib();
    toggleIncluded(group.id);
  };

  const handleLongPress = () => {
    TouchVib();
    toggleExcluded(group.id);
  };

  return (
    <List.Item
      title={group.name}
      left={checkBox}
      onPress={handlePress}
      onLongPress={handleLongPress}
    />
  );
};

export default GroupSelect;

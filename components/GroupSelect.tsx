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

import TouchVib from "@/util/TouchVib";
import { Group } from "@povario/2fauth.js";
import type { Dispatch, SetStateAction } from "react";
import { StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";

type SetNumberArray = Dispatch<SetStateAction<number[]>>;

interface AccountSorterProps {
  groups: Group[];
  selectedGroups: number[];
  setSelectedGroups: SetNumberArray;
}

const AccountSorter = ({ groups, selectedGroups, setSelectedGroups }: AccountSorterProps) => {
  const appendGroup = (groupId: number) => setSelectedGroups(current => current.concat([groupId]));
  const deleteGroup = (groupId: number) => setSelectedGroups(current => current.filter(id => id !== groupId));

  const styles = StyleSheet.create({
    view: {
      alignItems: "center",
      justifyContent: "center"
    }
  });

  const chips = groups.length
    ? groups.map(group => {
      if (group.id === 0) {
        return;
      }

      const isSelected = selectedGroups.includes(group.id);
      const toggle = () => isSelected
        ? deleteGroup(group.id)
        : appendGroup(group.id);

      return (
        <Chip
          key={group.id}
          onPressIn={TouchVib}
          onPress={toggle}
          selected={isSelected}
          showSelectedCheck
        >
          {group.name}
        </Chip>
      );
    })
    : undefined;

  return (
    <View style={styles.view}>
      {chips}
    </View>
  );
}

export default AccountSorter;

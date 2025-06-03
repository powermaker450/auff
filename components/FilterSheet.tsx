import {
  ComponentProps,
  ReactNode,
  RefObject,
  useCallback,
  useMemo
} from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { StyleProp } from "@/util/StyleProp";
import { useTheme } from "react-native-paper";
import TouchVib from "@/util/TouchVib";

type BottomSheetModalType = ComponentProps<typeof BottomSheetModal>;

interface FilterSheetProps {
  ref: RefObject<BottomSheetModal | null>;
  onChange?: (index: number) => void;
  onAnimate?: (from: number, to: number) => void;
  children?: ReactNode;
}

const FilterSheet = ({
  ref,
  onChange,
  onAnimate,
  children
}: FilterSheetProps) => {
  const theme = useTheme();
  const onAnimateInternal = useCallback(
    (from: number, to: number) => {
      from > -1 && TouchVib();
      onAnimate && onAnimate(from, to);
    },
    [onAnimate]
  );

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const styles: {
    sheet: BottomSheetModalType["style"];
    background: BottomSheetModalType["backgroundStyle"];
    content: StyleProp<typeof BottomSheetView>;
    handle: BottomSheetModalType["handleStyle"];
    handleIcon: BottomSheetModalType["handleIndicatorStyle"];
  } = {
    sheet: {
      margin: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 12
      },
      shadowOpacity: 0.58,
      shadowRadius: 16,
      elevation: 24
    },
    background: {
      backgroundColor: theme.colors.surfaceVariant
    },
    content: {
      flex: 1,
      paddingTop: 10,
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant
    },
    handle: {
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant
    },
    handleIcon: {
      backgroundColor: theme.colors.onSurfaceVariant
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      style={styles.sheet}
      enableDismissOnClose
      backgroundStyle={styles.background}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIcon}
      snapPoints={snapPoints}
      onChange={onChange}
      onAnimate={onAnimateInternal}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
};

export default FilterSheet;

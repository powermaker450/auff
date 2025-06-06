import { UseBiometricsResult } from "@/util/SetupDb";
import { StyleProp } from "@/util/StyleProp";
import TouchVib from "@/util/TouchVib";
import * as LocalAuthentication from "expo-local-authentication";
import { useSQLiteContext } from "expo-sqlite";
import {
  ComponentProps,
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import { View } from "react-native";
import {
  Button,
  Icon,
  Modal,
  Portal,
  Text,
  useTheme
} from "react-native-paper";

interface SecurityProviderProps {
  children: ReactNode;
}

interface SecurityData {
  authenticate: () => void;
}

const SecurityContext = createContext<SecurityData | undefined>(undefined);

type SecurityIcon = "check-circle" | "alert-circle" | "shield-lock";
type SecurityText = "App locked" | "Failed to authenticate." | "Success!";

interface SecurityStyleSheet {
  modal: StyleProp<typeof Modal>;
  modalContent: ComponentProps<typeof Modal>["contentContainerStyle"];
  text: StyleProp<typeof Text>;
  icon: StyleProp<typeof View>;
  button: StyleProp<typeof Button>;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [icon, setIcon] = useState<SecurityIcon>("shield-lock");
  const [text, setText] = useState<SecurityText>("App locked");
  const [screenShown, setScreenShown] = useState(false);

  const failed = () => {
    setIcon("alert-circle");
    setText("Failed to authenticate.");
  };

  const reset = () => {
    setIcon("shield-lock");
    setText("App locked");
  };

  const unlock = () => {
    setIcon("check-circle");
    setText("Success!");
    setTimeout(() => {
      setScreenShown(false);
      reset();
    }, 500);
  };

  const authenticate = () => {
    async function auth() {
      setScreenShown(true);

      const res = await LocalAuthentication.authenticateAsync();

      if (!res.success) {
        res.error === "authentication_failed" && failed();
        return;
      }

      unlock();
    }

    auth();
  };

  const retryAuth = () => {
    async function auth() {
      const res = await LocalAuthentication.authenticateAsync();

      if (!res.success) {
        res.error === "authentication_failed" && failed();
        return;
      }

      unlock();
    }

    auth();
  };

  useEffect(() => {
    async function config() {
      const useBiometricsLocal = await db.getFirstAsync<UseBiometricsResult>(
        "SELECT value FROM config WHERE key = 'useBiometrics'"
      );

      if (useBiometricsLocal?.value === "1") {
        authenticate();
      }
    }

    config()
  }, []);

  const styles = useMemo<SecurityStyleSheet>(
    () => ({
      modal: {
        backgroundColor: theme.colors.background,
        marginBottom: 0
      },
      icon: {
        margin: "auto",
        marginBottom: 10
      },
      text: {
        textAlign: "center",
        marginBottom: 10
      },
      modalContent: {
        flex: 1,
        alignContent: "center",
        justifyContent: "center"
      },
      button: {
        margin: "auto"
      }
    }),
    [theme]
  );

  return (
    <SecurityContext.Provider value={{ authenticate }}>
      <Portal>
        <Modal visible={screenShown} style={styles.modal} dismissable={false}>
          <View style={styles.icon}>
            <Icon source={icon} size={128} />
          </View>

          <Text style={styles.text} variant="headlineSmall">
            {text}
          </Text>

          {text !== "Success!" && (
            <Button
              style={styles.button}
              onPressIn={TouchVib}
              onPress={retryAuth}
            >
              Unlock
            </Button>
          )}
        </Modal>
      </Portal>

      {children}
    </SecurityContext.Provider>
  );
};

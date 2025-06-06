import SecureStoreWrapper from "@/util/SecureStoreWrapper";
import { TwoAuthApi } from "@povario/2fauth.js";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { AxiosError } from "axios";
import { useToast } from "./ToastProvider";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import TouchVib from "@/util/TouchVib";
import { router } from "expo-router";

interface ApiProviderProps {
  children: ReactNode;
}

interface SetupApiProps {
  baseUrl: string;
  token: string;
}

interface ApiData {
  api: TwoAuthApi;
  baseUrl: string;
  login: ({ baseUrl, token }: SetupApiProps) => void;
  logout: () => void;
  loggedIn: boolean;
  loading: boolean;
}

const ApiContext = createContext<ApiData | undefined>(undefined);

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const db = useSQLiteContext();
  const toast = useToast();
  const [api, setApi] = useState(new TwoAuthApi("http://localhost", ""));
  const [baseUrl, setBaseUrl] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  const login = ({ baseUrl, token }: SetupApiProps) => {
    SecureStoreWrapper.setItem("token", token);
    SecureStoreWrapper.setItem("baseUrl", baseUrl);
    setApi(new TwoAuthApi(baseUrl, token));
    setBaseUrl(baseUrl);
    setLoggedIn(true);
  };

  const logout = async () => {
    setLogoutVisible(false);

    setApi(new TwoAuthApi("http://localhost", ""));
    setBaseUrl("");
    setLoggedIn(false);

    await SecureStoreWrapper.setItem("token", "");
    await SecureStoreWrapper.setItem("baseUrl", "");

    await db.execAsync("DELETE FROM accounts");
    await db.execAsync("DELETE FROM groups");
    await db.execAsync(`
      DELETE FROM accounts;
      DELETE FROM groups;

      UPDATE config SET value = '[]' WHERE key = 'includedGroups' OR key = 'excludedGroups';
      UPDATE config SET value = '0' WHERE key = 'useBiometrics';
    `);

    router.replace("/login");
  };

  const getLocalCredentials = async () => {
    const token = await SecureStoreWrapper.getItem("token");
    const baseUrl = await SecureStoreWrapper.getItem("baseUrl");

    if (baseUrl && token) {
      setApi(new TwoAuthApi(baseUrl, token));
      setBaseUrl(baseUrl);
    }

    setLoggedIn(!!token);
    setLoading(false);
  };

  useEffect(() => {
    getLocalCredentials();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    async function checkLoggedIn() {
      // @ts-ignore
      if (api.axios.getUri() === "http://localhost") {
        setLoggedIn(false);
        return;
      }

      try {
        await api.self.getSelf();
      } catch (err) {
        if (err instanceof AxiosError) {
          toast.error(err.message);

          err.status == 401 && (await logout());
        }
      }
    }

    checkLoggedIn();
  }, [api]);

  const logoutDialog = (
    <Portal>
      <Dialog visible={logoutVisible} onDismiss={hideLogoutDialog}>
        <Dialog.Title>Log out</Dialog.Title>

        <Dialog.Content>
          <Text>Are you sure you want to log out?</Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPressIn={TouchVib} onPress={hideLogoutDialog}>
            Cancel
          </Button>

          <Button onPressIn={TouchVib} onPress={logout}>
            Log out
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <ApiContext.Provider
      value={{
        api,
        baseUrl,
        login,
        logout: showLogoutDialog,
        loggedIn,
        loading
      }}
    >
      {logoutDialog}
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);

  if (context === undefined) {
    throw new Error("useApi must be called within an ApiContext");
  }

  return context;
};

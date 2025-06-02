import SecureStoreWrapper from "@/util/SecureStoreWrapper";
import { TwoAuthApi } from "@povario/2fauth.js";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useToast } from "./ToastProvider";

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
  const login = ({ baseUrl, token }: SetupApiProps) => {
    SecureStoreWrapper.setItem("token", token);
    SecureStoreWrapper.setItem("baseUrl", baseUrl);
    setApi(new TwoAuthApi(baseUrl, token));
    setBaseUrl(baseUrl);
    setLoggedIn(true);
  };

  const logout = async () => {
    setApi(new TwoAuthApi("http://localhost", ""));
    setBaseUrl("");
    setLoggedIn(false);

    await SecureStoreWrapper.setItem("token", "");
    await SecureStoreWrapper.setItem("baseUrl", "");
    await db.execAsync("DELETE FROM accounts");
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
  }

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

          err.status == 401 && await logout(); 
        }
      }
    }

    checkLoggedIn();
  }, [api]);

  return (
    <ApiContext.Provider
      value={{
        api,
        baseUrl,
        login,
        logout,
        loggedIn,
        loading
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => {
  const context = useContext(ApiContext);

  if (context === undefined) {
    throw new Error("useApi must be called within an ApiContext");
  }

  return context;
}

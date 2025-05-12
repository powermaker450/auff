import { TwoFAccount } from "@povario/2fauth.js";
import { useSQLiteContext } from "expo-sqlite";
import { HmacAlgorithm, useExpoTotp } from "expo-totp";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface OtpProviderProps {
  children?: ReactNode;
}

interface OtpProviderData {
  setAccount: (id: number) => void;
  clearAccount: () => void;
  code: string | null;
  remainingTime: number | null; 
}

const OtpContext = createContext<OtpProviderData | undefined>(undefined);

export const OtpProvider = ({ children }: OtpProviderProps) => {
  const db = useSQLiteContext();
  const totp = useExpoTotp();
  const [id, setId] = useState<number>();
  const setAccount = (id: number) => setId(id);
  const clearAccount = () => setId(undefined);

  const start = useCallback(async () => {
    if (!id) {
      return;
    }

    const account = await db.getFirstAsync<TwoFAccount<true>>(`SELECT * FROM accounts WHERE id = ${id}`);
    if (!account) {
      throw new Error(`No valid account with ID ${id} was found`);
    }

    if (account.otp_type === "hotp") {
      totp.start(account.secret, {
        algorithm: account.algorithm.toUpperCase() as HmacAlgorithm,
        digits: account.digits!
      });
    }

    if (account.otp_type === "totp") {
      totp.start(account.secret, {
        algorithm: account.algorithm.toUpperCase() as HmacAlgorithm,
        digits: account.digits!,
        interval: account.period
      });
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      totp.stop();
    }

    start()
      .catch(console.error);
  }, [id]);

  return (
    <OtpContext.Provider
      value={{
        code: totp.code,
        setAccount,
        clearAccount,
        remainingTime: totp.remainingTime
      }}
    >
      {children}
    </OtpContext.Provider>
  )
}

export const useOtp = () => {
  const context = useContext(OtpContext);

  if (context === undefined) {
    throw new Error("useOtp must be called within an OtpContext");
  }

  return context;
}

import { TwoFAccount } from "@povario/2fauth.js";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { HOTP, TOTP } from "otpauth";

interface OtpProviderProps {
  children?: ReactNode;
}

interface OtpProviderData {
  setAccount: (id: number) => void;
  clearAccount: () => void;
  code: string | null;
}

const OtpContext = createContext<OtpProviderData | undefined>(undefined);

export const OtpProvider = ({ children }: OtpProviderProps) => {
  const db = useSQLiteContext();
  const [id, setId] = useState<number | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const setAccount = (id: number) => setId(id);
  const clearAccount = () => setId(null);

  const start = useCallback(async () => {
    if (!id) {
      return;
    }

    const account = await db.getFirstAsync<TwoFAccount<true>>(`SELECT * FROM accounts WHERE id = ${id}`);
    if (!account) {
      throw new Error(`No valid account with ID ${id} was found`);
    }

    if (account.otp_type === "hotp") {
      const hotp = new HOTP({
        algorithm: account.algorithm.toUpperCase(),
        secret: account.secret,
        counter: account.counter,
        digits: account.digits!,
      });

      setCode(hotp.generate());
      return;
    }

    const totp = new TOTP({
      algorithm: account.algorithm.toUpperCase(),
      secret: account.secret,
      digits: account.digits!,
      period: account.period
    });
    
    setCode(totp.generate());
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    start()
      .catch(console.error);
  }, [id]);

  return (
    <OtpContext.Provider
      value={{
        code,
        setAccount,
        clearAccount
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

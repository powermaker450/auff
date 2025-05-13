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
  code?: string;
  maxTime?: number;
  remainingTime?: number;
  accountName?: string;
  serviceName?: string;
}

const OtpContext = createContext<OtpProviderData | undefined>(undefined);

export const OtpProvider = ({ children }: OtpProviderProps) => {
  const MS_TO_SECONDS = 0.001;

  const db = useSQLiteContext();
  const [id, setId] = useState<number | null>(null);
  const [code, setCode] = useState<string>();
  const [maxTime, setMaxTime] = useState<number>();
  const [remainingTime, setRemainingTime] = useState<number>();
  const [accountName, setAccountName] = useState<string>();
  const [serviceName, setServiceName] = useState<string>();
  const [generator, setGenerator] = useState<number>();
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

    setServiceName(account.service ?? "[No Name]");
    setAccountName(account.account);

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

    setMaxTime(account.period ?? 30);
    console.log(account);
    const totp = new TOTP({
      algorithm: account.algorithm.toUpperCase(),
      secret: account.secret,
      digits: account.digits!,
      period: account.period
    });

    const update = () => {
      const inSeconds = ~~(totp.remaining() * MS_TO_SECONDS);

      setCode(totp.generate());
      setRemainingTime(inSeconds);
    }
    update();

    setGenerator(
      setInterval(update, 1000)
    );
  }, [id]);

  const stop = useCallback(() => {
    if (!generator) {
      return;
    }

    clearInterval(generator);
    setGenerator(undefined);
  }, [generator]);

  useEffect(() => {
    if (!id) {
      stop();
      return;
    }

    start()
      .catch(console.error);
  }, [id]);

  return (
    <OtpContext.Provider
      value={{
        setAccount,
        clearAccount,
        code,
        maxTime,
        remainingTime,
        accountName,
        serviceName
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

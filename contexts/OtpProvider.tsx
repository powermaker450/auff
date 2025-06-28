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

import { TwoFAccount } from "@povario/2fauth.js";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { HOTP, TOTP } from "otpauth";
import { useApi } from "./ApiProvider";

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
  icon?: string;
}

const OtpContext = createContext<OtpProviderData | undefined>(undefined);

export const OtpProvider = ({ children }: OtpProviderProps) => {
  const MS_TO_SECONDS = 0.001;

  const db = useSQLiteContext();
  const { baseUrl } = useApi();
  const [id, setId] = useState<number>();
  const [code, setCode] = useState<string>();
  const [maxTime, setMaxTime] = useState<number>();
  const [remainingTime, setRemainingTime] = useState<number>();
  const [accountName, setAccountName] = useState<string>();
  const [serviceName, setServiceName] = useState<string>();
  const [icon, setIcon] = useState<string>();
  const [generator, setGenerator] = useState<number>();
  const setAccount = (id: number) => setId(id);
  const clearAccount = () => setId(undefined);

  const start = useCallback(async () => {
    if (!id) {
      return;
    }

    const account = await db.getFirstAsync<TwoFAccount<true>>(
      `SELECT * FROM accounts WHERE id = ${id}`
    );
    if (!account) {
      throw new Error(`No valid account with ID ${id} was found`);
    }

    setServiceName(account.service ?? "[No Name]");
    setAccountName(account.account);
    setIcon(baseUrl + `/storage/icons/${account.icon ?? "noicon.svg"}`);

    if (account.otp_type === "hotp") {
      const hotp = new HOTP({
        algorithm: account.algorithm.toUpperCase(),
        secret: account.secret,
        counter: account.counter,
        digits: account.digits!
      });

      setCode(hotp.generate());
      return;
    }

    setMaxTime(account.period ?? 30);
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
    };
    update();

    setGenerator(setInterval(update, 1000));
  }, [baseUrl, id]);

  const stop = useCallback(() => {
    if (!generator) {
      return;
    }

    clearInterval(generator);
    setGenerator(undefined);

    setCode(undefined);
    setMaxTime(undefined);
    setRemainingTime(undefined);
    setAccountName(undefined);
    setServiceName(undefined);
    setIcon(undefined);
  }, [generator]);

  useEffect(() => {
    if (!id) {
      stop();
      return;
    }

    start().catch(console.error);
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
        serviceName,
        icon
      }}
    >
      {children}
    </OtpContext.Provider>
  );
};

export const useOtp = () => {
  const context = useContext(OtpContext);

  if (context === undefined) {
    throw new Error("useOtp must be called within an OtpContext");
  }

  return context;
};

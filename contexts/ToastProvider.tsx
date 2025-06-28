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

import { StyleProp } from "@/util/StyleProp";
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";
import { createContext, ReactNode, useContext, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";

interface ToastProviderProps {
  children?: ReactNode;
}

interface ToastProviderData {
  show: (text: string) => void;
  error: (text: string) => void;
}

const ToastContext = createContext<ToastProviderData | undefined>(undefined);

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [text, setText] = useState("");
  const [notice, setNotice] = useState(false);
  const hideNotice = () => {
    setNotice(false);
    setText("");
  };

  const show = (text: string) => {
    notificationAsync(NotificationFeedbackType.Success);
    setText(text);
    setNotice(true);
    setTimeout(hideNotice, 2000);
  };

  const error = (text: string) => {
    notificationAsync(NotificationFeedbackType.Error);
    setText(text);
    setNotice(true);
    setTimeout(hideNotice, 2000);
  };

  const styles: { bar: StyleProp<typeof Snackbar> } = {
    bar: {
      width: "95%",
      alignSelf: "center",
      marginBottom: 15
    }
  };

  return (
    <ToastContext.Provider value={{ show, error }}>
      {children}

      <Portal>
        <Snackbar style={styles.bar} visible={notice} onDismiss={hideNotice}>
          {text}
        </Snackbar>
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be called within a ToastProvider");
  }

  return context;
};

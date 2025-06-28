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

import MainView from "@/components/MainView";
import { useApi } from "@/contexts/ApiProvider";
import { StyleProp } from "@/util/StyleProp";
import { useCallback, useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import { router } from "expo-router";
import TouchVib from "@/util/TouchVib";

const Login = () => {
  const { login } = useApi();

  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const emptyFields = !baseUrl.startsWith("http") || !token;

  const execLogin = useCallback(() => {
    login({ baseUrl, token });
    router.replace("/(app)");
  }, [baseUrl, token]);

  const styles: {
    title: StyleProp<typeof Text>;
    input: StyleProp<typeof TextInput>;
  } = {
    title: {
      fontWeight: "bold",
      marginBottom: 15
    },
    input: {
      marginLeft: 20,
      marginRight: 20,
      marginBottom: 20,
      alignSelf: "stretch"
    }
  };

  return (
    <MainView>
      <Text style={styles.title} variant="headlineLarge">
        Auff
      </Text>

      <TextInput
        style={styles.input}
        mode="outlined"
        label="URL"
        value={baseUrl}
        onChangeText={text => setBaseUrl(text)}
      />

      <TextInput
        style={styles.input}
        mode="outlined"
        label="Token"
        secureTextEntry
        value={token}
        onChangeText={text => setToken(text)}
      />

      <Button
        mode="contained"
        onPressIn={TouchVib}
        onPress={execLogin}
        disabled={emptyFields}
      >
        Login
      </Button>
    </MainView>
  );
};

export default Login;

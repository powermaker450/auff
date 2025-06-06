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

import { useApi } from "@/contexts/ApiProvider";
import { useToast } from "@/contexts/ToastProvider";
import TouchVib from "@/util/TouchVib";
import { TwoFAccount } from "@povario/2fauth.js";
import { router } from "expo-router";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Surface,
  Text
} from "react-native-paper";
import { View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner
} from "react-native-vision-camera";

interface ScanStyleSheet {
  view: ComponentProps<typeof View>["style"];
  cameraView: ComponentProps<typeof Camera>["style"];
  surface: ComponentProps<typeof Surface>["style"];
  surfaceTitle: ComponentProps<typeof Text>["style"];
  buttonContainer: ComponentProps<typeof View>["style"];
}

const Scan = () => {
  const { api } = useApi();
  const device = useCameraDevice("back");
  const camera = useCameraPermission();
  const toast = useToast();

  const [scanned, setScanned] = useState(false);
  const [uri, setUri] = useState<string>();

  const [accountPreview, setAccountPreview] = useState<TwoFAccount>();

  const [previewLoading, setPreviewLoading] = useState(false);
  const startPreviewLoading = () => setPreviewLoading(true);
  const stopPreviewLoading = () => setPreviewLoading(false);

  const [createLoading, setCreateLoading] = useState(false);
  const startCreateLoading = () => setCreateLoading(true);
  const stopCreateLoading = () => setCreateLoading(false);

  const scanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: codes => {
      async function getPreview(uri: string) {
        startPreviewLoading();

        try {
          const res = await api.accounts.preview(uri);
          setAccountPreview(res);
        } catch (err) {
          if (err instanceof Error) {
            toast.error(err.message);
          }
        } finally {
          stopPreviewLoading();
        }
      }

      if (!codes[0].value?.startsWith("otpauth://")) {
        toast.error("QR code was not a valid two factor auth code");
        router.back();
        return;
      }

      getPreview(codes[0].value);
      setUri(codes[0].value);
      setScanned(true);
    }
  });

  useEffect(() => {
    async function requestPerm() {
      if (!camera.hasPermission) {
        const perm = await camera.requestPermission();

        if (!perm) {
          toast.error("Camera permission was denied");
          router.back();
        }
      }
    }

    requestPerm();
  }, [camera]);

  const createAccount = useCallback(async () => {
    if (!uri) {
      return;
    }

    startCreateLoading();

    try {
      const res = await api.accounts.create({ uri });
      toast.show(`${res.service ?? "Account"} created.`);
      router.back();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      stopCreateLoading();
    }
  }, [uri]);

  const styles: ScanStyleSheet = {
    view: {
      width: "95%",
      alignSelf: "center",
      justifyContent: "center",
      gap: 20
    },
    cameraView: {
      flex: 1
    },
    surface: {
      height: "50%",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center"
    },
    surfaceTitle: {
      fontWeight: "bold"
    },
    buttonContainer: {
      alignSelf: "center",
      flexDirection: "row",
      gap: 15
    }
  };

  const cameraView =
    !scanned && camera.hasPermission && device ? (
      <Camera
        style={styles.cameraView}
        device={device}
        codeScanner={scanner}
        isActive
      />
    ) : undefined;

  const preview =
    scanned && accountPreview ? (
      <View style={styles.view}>
        <Text variant="bodyLarge" style={{ alignSelf: "center" }}>
          Add this {accountPreview.otp_type.toUpperCase()} account?
        </Text>

        <Surface style={styles.surface} elevation={5}>
          <Text style={styles.surfaceTitle} variant="headlineLarge">
            {accountPreview.service ?? "[No Service Name]"}
          </Text>

          <Text variant="headlineSmall">{accountPreview.account}</Text>
        </Surface>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained-tonal"
            onPressIn={TouchVib}
            onPress={router.back}
            disabled={createLoading}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPressIn={TouchVib}
            onPress={createAccount}
            disabled={createLoading}
          >
            Upload account
          </Button>
        </View>
      </View>
    ) : undefined;

  const loadingIcon = <ActivityIndicator animating size={48} />;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title="Scan QR Code" />
      </Appbar.Header>

      {previewLoading ? loadingIcon : undefined}
      {scanned ? preview : cameraView}
    </>
  );
};

export default Scan;

import { useApi } from "@/contexts/ApiProvider";
import { useToast } from "@/contexts/ToastProvider";
import TouchVib from "@/util/TouchVib";
import { AlgorithmType, Group, OtpType } from "@povario/2fauth.js";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { View, KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Chip,
  Icon,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

type TypeOrNull<T> = T | null;

interface CreateStyleSheet {
  view: ComponentProps<typeof ScrollView>["style"];
  viewContent: ComponentProps<typeof ScrollView>["contentContainerStyle"];
  iconPreview: ComponentProps<typeof View>["style"];
  icon: ComponentProps<typeof Image>["style"];
  fetchIconButton: ComponentProps<typeof Button>["style"];
  chipContainer: ComponentProps<typeof View>["style"];
  label: ComponentProps<typeof Text>["style"];
  subLabel: ComponentProps<typeof Text>["style"];
}

const Create = () => {
  const { api, baseUrl } = useApi();
  const toast = useToast();
  const theme = useTheme();

  const digitOptions = useMemo(() => [6, 7, 8, 9, 10], []);

  const algorithmOptions = useMemo<AlgorithmType[]>(
    () => ["sha1", "sha256", "sha512", "md5"],
    []
  );

  const [groups, setGroups] = useState<Group[]>([]);

  const [service, setService] = useState("");
  const [account, setAccount] = useState("");

  const [icon, setIcon] = useState<TypeOrNull<string>>(null);
  const clearIcon = () => setIcon(null);

  const [group_id, setGroupId] = useState<TypeOrNull<number>>(null);
  const [otp_type, setType] = useState<OtpType>("totp");
  const [secret, setSecret] = useState("");
  const [digits, setDigits] = useState<TypeOrNull<number>>(null);
  const [algorithm, setAlgorithm] = useState<TypeOrNull<AlgorithmType>>(null);

  const [period, setPeriod] = useState("30");
  const [counter, setCounter] = useState("0");

  const invalidFields =
    !service.trim() ||
    !account.trim() ||
    !secret.trim() ||
    (otp_type === "totp" ? !Number(period) : !Number(counter));

  const [iconLoading, setIconLoading] = useState(false);
  const startIconLoading = () => setIconLoading(true);
  const stopIconLoading = () => setIconLoading(false);

  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const fetchIcon = useCallback(async () => {
    startIconLoading();

    try {
      const res = await api.icons.query({
        service,
        iconCollection: "selfh"
      });

      setIcon(res.filename);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      stopIconLoading();
    }
  }, [api, baseUrl, service]);

  async function create() {
    startLoading();

    try {
      otp_type === "totp"
        ? await api.accounts.create({
            otp_type,
            service,
            account,
            icon,
            group_id,
            secret,
            digits,
            algorithm,
            period: Number(period)
          })
        : await api.accounts.create({
            otp_type,
            service,
            account,
            icon,
            group_id,
            secret,
            digits,
            algorithm,
            counter: Number(counter)
          });

      toast.show(`Account ${service} created`);
      router.back();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    async function getGroups() {
      try {
        const res = await api.groups.getAll();
        setGroups(res);
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    }

    getGroups();
  }, []);

  const styles: CreateStyleSheet = {
    view: {
      width: "95%",
      margin: "auto"
    },
    viewContent: {
      gap: 15
    },
    iconPreview: {
      alignSelf: "center",
      flexDirection: "row",
      gap: 5
    },
    icon: {
      width: 100,
      height: 100
    },
    fetchIconButton: {
      alignSelf: "center"
    },
    chipContainer: {
      flexDirection: "row",
      gap: 10
    },
    label: {
      fontWeight: "bold"
    },
    subLabel: {
      color: theme.colors.onSurfaceVariant
    }
  };

  const iconPreview = (
    <View style={styles.iconPreview}>
      {icon ? (
        <Image
          style={styles.icon}
          source={baseUrl + `/storage/icons/${icon}`}
        />
      ) : (
        <Icon source="account-circle" size={60} />
      )}
    </View>
  );

  const groupChips = groups.length ? (
    groups.map(group => (
      <Chip
        key={group.id}
        onPressIn={TouchVib}
        onPress={() => setGroupId(group.id !== 0 ? group.id : null)}
        showSelectedCheck
        showSelectedOverlay
        selected={group.id !== 0 ? group_id === group.id : group_id === null}
      >
        {group.id !== 0 ? group.name : "None"}
      </Chip>
    ))
  ) : (
    <ActivityIndicator animating />
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPressIn={TouchVib} onPress={router.back} />
        <Appbar.Content title="New Account" />
      </Appbar.Header>

      <KeyboardAvoidingView behavior="padding">
        <ScrollView
          style={styles.view}
          contentContainerStyle={styles.viewContent}
        >
          <SegmentedButtons
            value={otp_type}
            onValueChange={setType}
            buttons={[
              {
                value: "totp",
                label: "TOTP",
                showSelectedCheck: true,
                onPress: TouchVib
              },
              {
                value: "hotp",
                label: "HOTP",
                showSelectedCheck: true,
                onPress: TouchVib
              }
            ]}
          />

          {iconPreview}

          <TextInput
            mode="outlined"
            label="Service"
            value={service}
            onChangeText={setService}
          />

          <Button
            style={styles.fetchIconButton}
            mode="contained"
            onPressIn={TouchVib}
            onPress={icon ? clearIcon : fetchIcon}
            disabled={iconLoading || !service.trim()}
          >
            {icon ? "Clear icon" : "Try fetching icon"}
          </Button>

          <TextInput
            mode="outlined"
            label="Account"
            value={account}
            onChangeText={setAccount}
          />

          <Text variant="titleLarge" style={styles.label}>
            Group
          </Text>
          <View style={styles.chipContainer}>{groupChips}</View>

          <TextInput
            mode="outlined"
            label="Secret"
            value={secret}
            onChangeText={setSecret}
          />

          <Text variant="titleLarge" style={styles.label}>
            Digits
          </Text>
          <Text variant="titleSmall" style={styles.subLabel}>
            Default is 6
          </Text>
          <View style={styles.chipContainer}>
            {digitOptions.map(digit => (
              <Chip
                key={digit}
                onPressIn={TouchVib}
                onPress={() => setDigits(digit)}
                selected={digits === digit}
                showSelectedCheck
                showSelectedOverlay
              >
                {digit}
              </Chip>
            ))}
          </View>

          <Text variant="titleLarge" style={styles.label}>
            Algorithm
          </Text>
          <Text variant="titleSmall" style={styles.subLabel}>
            Default is sha1
          </Text>
          <View style={styles.chipContainer}>
            {algorithmOptions.map(thisAlgorithm => (
              <Chip
                key={thisAlgorithm}
                onPressIn={TouchVib}
                onPress={() => setAlgorithm(thisAlgorithm)}
                selected={algorithm === thisAlgorithm}
                showSelectedCheck
                showSelectedOverlay
              >
                {thisAlgorithm}
              </Chip>
            ))}
          </View>

          <TextInput
            mode="outlined"
            label={otp_type === "totp" ? "Period" : "Counter"}
            placeholder={otp_type === "totp" ? "30" : "0"}
            value={otp_type === "totp" ? period : counter}
            onChangeText={otp_type === "totp" ? setPeriod : setCounter}
          />

          <Button
            mode="contained-tonal"
            onPressIn={TouchVib}
            onPress={router.back}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPressIn={TouchVib}
            onPress={create}
            disabled={loading || invalidFields}
          >
            Create
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Create;

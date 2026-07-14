import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import BackArrowButton from "../../../components/auth/BackArrowButton";
import TextField from "../../../components/ui/TextField";
import Button from "../../../components/ui/Button";
import { checkUsernameUnique } from "../../../api/user";
import { completeGoogleSignup } from "../../../api/googleAuth";
import { useAuth } from "../../../context/AuthContext";
import { tokens } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing } from "../../../theme/spacing";

type RouteParams = {
  idToken: string;
  email: string;
  fullName: string;
  suggestedUsername: string;
};

const USERNAME_PATTERN = /^@[a-zA-Z0-9_]{4,}$/;

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Shown after a brand-new Google identity signs in — Google can't supply a
 * door number/community, so this collects those (plus confirms/edits the
 * suggested username) before the account is actually created.
 */
const CompleteGoogleProfile: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { idToken, email, fullName, suggestedUsername } = route.params as RouteParams;
  const { signIn } = useAuth();

  const [username, setUsername] = useState(suggestedUsername);
  const [checking, setChecking] = useState(false);
  const [unique, setUnique] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const debouncedCheck = debounce(async (uname: string) => {
    const isUnique = await checkUsernameUnique(uname);
    setUnique(isUnique);
    setValidationMsg(isUnique ? "Username is available!" : "Username not available!");
    setChecking(false);
  }, 400);

  useEffect(() => {
    setValidationMsg("");
    setUnique(false);
    if (!USERNAME_PATTERN.test(username)) {
      setValidationMsg("Invalid username");
      return;
    }
    setChecking(true);
    debouncedCheck(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const canSubmit = unique && !checking && doorNumber.trim().length > 0 && !submitting;
  const isSuccess = unique && validationMsg === "Username is available!";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { token } = await completeGoogleSignup(
        idToken,
        username,
        doorNumber.trim(),
        "Sobha HRC Prestine, Jakkuru"
      );
      await signIn(token);
    } catch (err: any) {
      Alert.alert(
        "Couldn't finish signing up",
        err?.response?.data?.message ?? "Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackArrowButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Image source={require("../../../../assets/images/zencoo.png")} style={styles.logo} />
      </View>

      <Text style={styles.headline}>Welcome{fullName ? `, ${fullName}` : ""}!</Text>
      <Text style={styles.subtext}>
        Just a couple more details to finish setting up {email}.
      </Text>

      <TextField
        label="Username"
        placeholder="@username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        error={!isSuccess && !checking && validationMsg ? validationMsg : undefined}
        success={isSuccess && !checking ? validationMsg : undefined}
        rightAccessory={checking ? <ActivityIndicator size="small" color={tokens.ink400} /> : undefined}
      />
      <TextField label="Door Number" placeholder="A101" value={doorNumber} onChangeText={setDoorNumber} />

      <Button
        title="Continue"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!canSubmit}
        style={{ marginTop: spacing.sm }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 140,
    height: 46,
    resizeMode: "contain",
  },
  headline: {
    ...typography.title,
    color: tokens.ink900,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtext: {
    ...typography.body,
    color: tokens.ink600,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

export default CompleteGoogleProfile;

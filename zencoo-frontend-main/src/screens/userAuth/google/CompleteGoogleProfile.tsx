import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "../../../styles/signupStyles";
import AuthLogo from "../../../components/auth/AuthLogo";
import BackArrowButton from "../../../components/auth/BackArrowButton";
import FormField from "../../../components/auth/FormField";
import { checkUsernameUnique } from "../../../api/user";
import { completeGoogleSignup } from "../../../api/googleAuth";
import { useAuth } from "../../../context/AuthContext";

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
  const [validationColor, setValidationColor] = useState("#888");
  const [doorNumber, setDoorNumber] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedCheck = debounce(async (uname: string) => {
    const isUnique = await checkUsernameUnique(uname);
    setUnique(isUnique);
    setValidationMsg(isUnique ? "Username is available!" : "Username not available!");
    setValidationColor(isUnique ? "green" : "red");
    setChecking(false);
  }, 400);

  useEffect(() => {
    setValidationMsg("");
    setUnique(false);
    if (!USERNAME_PATTERN.test(username)) {
      setValidationMsg("Invalid username");
      setValidationColor("red");
      return;
    }
    setChecking(true);
    debouncedCheck(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const canSubmit = unique && !checking && doorNumber.trim().length > 0 && !submitting;

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
      <AuthLogo containerStyle={styles.logoContainer} />
      <Text style={{ fontSize: 18, marginBottom: 4, textAlign: "center" }}>
        Welcome{fullName ? `, ${fullName}` : ""}!
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 16, textAlign: "center", color: "#888" }}>
        Just a couple more details to finish setting up {email}.
      </Text>

      <FormField
        placeholder="@username"
        focused={focusedInput === "username"}
        showError={false}
        styles={styles}
        value={username}
        onChangeText={setUsername}
        onFocus={() => setFocusedInput("username")}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="none"
      />
      {checking && <ActivityIndicator size="small" />}
      {validationMsg !== "" && (
        <Text style={{ color: validationColor, marginTop: 4, marginBottom: 8 }}>
          {validationMsg}
        </Text>
      )}

      <FormField
        placeholder="Door Number"
        focused={focusedInput === "doorNumber"}
        showError={false}
        styles={styles}
        value={doorNumber}
        onChangeText={setDoorNumber}
        onFocus={() => setFocusedInput("doorNumber")}
        onBlur={() => setFocusedInput(null)}
      />

      <TouchableOpacity
        style={[styles.button, !canSubmit && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CompleteGoogleProfile;

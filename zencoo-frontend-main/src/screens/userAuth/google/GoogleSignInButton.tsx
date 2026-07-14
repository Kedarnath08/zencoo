import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../../context/AuthContext";
import { loginWithGoogle } from "../../../api/googleAuth";
import {
  GOOGLE_OAUTH_CLIENT_ID_WEB,
  GOOGLE_OAUTH_CLIENT_ID_IOS,
  GOOGLE_OAUTH_CLIENT_ID_ANDROID,
} from "../../../config/env";
import { tokens } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";

// Required once per app so the OAuth browser tab closes itself after redirecting back.
WebBrowser.maybeCompleteAuthSession();

/**
 * "Continue with Google" — handles the OAuth prompt, sends the resulting ID
 * token to the backend, then either signs the user in directly (existing/
 * linked account) or hands off to CompleteGoogleProfile for a brand-new
 * Google identity (which still needs a door number/community).
 */
const GoogleSignInButton: React.FC = () => {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_OAUTH_CLIENT_ID_WEB,
    iosClientId: GOOGLE_OAUTH_CLIENT_ID_IOS,
    androidClientId: GOOGLE_OAUTH_CLIENT_ID_ANDROID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken =
      response.authentication?.idToken ?? (response.params as any)?.id_token;
    if (!idToken) {
      Alert.alert(
        "Google sign-in failed",
        "No identity token was returned. Please try again."
      );
      return;
    }

    (async () => {
      setSubmitting(true);
      try {
        const result = await loginWithGoogle(idToken);
        if (result.isNewUser) {
          navigation.navigate("CompleteGoogleProfile", {
            idToken,
            email: result.email ?? "",
            fullName: result.fullName ?? "",
            suggestedUsername: result.suggestedUsername ?? "",
          });
        } else if (result.token) {
          await signIn(result.token);
        }
      } catch (err: any) {
        Alert.alert(
          "Google sign-in failed",
          err?.response?.data?.message ?? "Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      disabled={!request || submitting}
      onPress={() => promptAsync()}
      activeOpacity={0.7}
    >
      {submitting ? (
        <ActivityIndicator color={tokens.ink600} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color={tokens.ink600} style={{ marginRight: 10 }} />
          <Text style={styles.text}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: tokens.line,
    borderRadius: radius.pill,
    height: 50,
    marginTop: 12,
    backgroundColor: tokens.surface,
  },
  text: {
    ...typography.heading,
    color: tokens.ink600,
  },
});

export default GoogleSignInButton;

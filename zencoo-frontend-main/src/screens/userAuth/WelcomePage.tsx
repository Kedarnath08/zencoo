import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import GoogleSignInButton from "./google/GoogleSignInButton";
import Button from "../../components/ui/Button";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

export default function WelcomePage({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandArea}>
        <View style={styles.brandCircle} />
        <Image
          source={require("../../../assets/images/zencoo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>Welcome to Zencoo</Text>
        <Text style={styles.body}>
          Connect with your community, stay updated, and enjoy a seamless
          living experience.
        </Text>

        <View style={styles.actions}>
          <Button title="Sign Up" onPress={() => navigation.navigate("SignUpStepOne")} />
          <GoogleSignInButton />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.surface,
  },
  brandArea: {
    height: "38%",
    backgroundColor: tokens.primaryTint,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: tokens.primary,
    opacity: 0.08,
    top: -60,
    right: -60,
  },
  logo: {
    width: 220,
    height: 74,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  headline: {
    ...typography.display,
    color: tokens.ink900,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: tokens.ink600,
    textAlign: "center",
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: tokens.ink600,
  },
  footerLink: {
    ...typography.body,
    fontWeight: "700",
    color: tokens.primary,
  },
});

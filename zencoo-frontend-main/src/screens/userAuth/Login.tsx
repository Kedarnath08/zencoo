import React from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { loginUser } from "../../api/user";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "./google/GoogleSignInButton";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../../assets/images/zencoo.png")}
          style={styles.logo}
        />
        <Text style={styles.headline}>Log in</Text>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            setSubmitting(true);
            const result = await loginUser(values.email, values.password);
            setSubmitting(false);
            if (!result.success || !result.token) {
              setErrors({ email: result.error ?? "Login failed" });
              return;
            }
            await signIn(result.token);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <TextField
                label="Email"
                placeholder="you@example.com"
                error={touched.email ? errors.email : undefined}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextField
                label="Password"
                placeholder="Enter your password"
                error={touched.password ? errors.password : undefined}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry
              />
              <Button
                title="Log In"
                onPress={handleSubmit as any}
                loading={isSubmitting}
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
        </Formik>

        <GoogleSignInButton />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text
            style={styles.footerLink}
            onPress={() =>
              navigation && navigation.navigate ? navigation.navigate("SignUpStepOne") : null
            }
          >
            Sign up
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  logo: {
    width: 160,
    height: 54,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.title,
    color: tokens.ink900,
    marginBottom: spacing.xl,
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

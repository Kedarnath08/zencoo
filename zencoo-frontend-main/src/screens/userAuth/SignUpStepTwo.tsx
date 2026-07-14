import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import BackArrowButton from "../../components/auth/BackArrowButton";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function SignUpStepTwo({ navigation, route }: any) {
  const { fullName = "", email = "", doorNumber = "", community = "" } = route?.params || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={styles.container}>
      <BackArrowButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Image source={require("../../../assets/images/zencoo.png")} style={styles.logo} />
        <StepIndicator step={2} total={3} />
      </View>

      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={PasswordSchema}
        validateOnMount
        onSubmit={(values) => {
          navigation.navigate("SignUpStepThree", {
            fullName,
            email,
            doorNumber,
            community,
            password: values.password,
          });
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldTouched,
        }) => (
          <>
            <Text style={styles.headline}>Set your password</Text>

            <TextField
              label="Password"
              placeholder="Create a password"
              error={touched.password ? errors.password : undefined}
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              secureTextEntry={!showPassword}
              rightAccessory={
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={tokens.ink400}
                  />
                </TouchableOpacity>
              }
            />
            <TextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              secureTextEntry={!showConfirm}
              rightAccessory={
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                  <Ionicons
                    name={showConfirm ? "eye-off" : "eye"}
                    size={20}
                    color={tokens.ink400}
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Next"
              onPress={() => {
                setFieldTouched("password", true);
                setFieldTouched("confirmPassword", true);
                if (
                  !errors.password &&
                  !errors.confirmPassword &&
                  values.password &&
                  values.confirmPassword
                ) {
                  handleSubmit();
                }
              }}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 140,
    height: 46,
    resizeMode: "contain",
    marginBottom: spacing.lg,
  },
  headline: {
    ...typography.title,
    color: tokens.ink900,
    marginBottom: spacing.xl,
  },
});

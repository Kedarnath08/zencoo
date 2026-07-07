import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/signupStyles";
import AuthLogo from "../../components/auth/AuthLogo";
import BackArrowButton from "../../components/auth/BackArrowButton";
import LoginFooterLink from "../../components/auth/LoginFooterLink";
import FormField from "../../components/auth/FormField";

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function SignUpStepTwo({ navigation, route }: any) {
  const {
    fullName = "",
    email = "",
    doorNumber = "",
    community = "",
  } = route?.params || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackArrowButton onPress={() => navigation.goBack()} />
      <AuthLogo containerStyle={styles.logoContainer} />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Set your password
      </Text>
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
          isValid,
          setFieldTouched,
        }) => (
          <>
            {/* Create Password */}
            <View style={{ position: "relative", marginBottom: 8, height: 48 }}>
              <FormField
                placeholder="Create Password"
                focused={focusedInput === "password"}
                showError={false}
                styles={styles}
                style={{ paddingRight: 40 }}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedInput("password")}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 12,
                  top: 0,
                  height: 48,
                  width: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                }}
                onPress={() => setShowPassword((v) => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <View style={{ position: "relative", marginBottom: 8, height: 48 }}>
              <FormField
                placeholder="Confirm Password"
                focused={focusedInput === "confirmPassword"}
                showError={false}
                styles={styles}
                style={{ paddingRight: 40 }}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                secureTextEntry={!showConfirm}
                onFocus={() => setFocusedInput("confirmPassword")}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 12,
                  top: 0,
                  height: 48,
                  width: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                }}
                onPress={() => setShowConfirm((v) => !v)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {/* Next Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // Mark fields as touched to trigger validation and show errors
                setFieldTouched("password", true);
                setFieldTouched("confirmPassword", true);

                // If there are no errors, submit
                if (
                  !errors.password &&
                  !errors.confirmPassword &&
                  values.password &&
                  values.confirmPassword
                ) {
                  handleSubmit();
                }
              }}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>

            <LoginFooterLink
              onPress={() => navigation.navigate("Login")}
              styles={styles}
            />
          </>
        )}
      </Formik>
    </View>
  );
}

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/signupStyles";

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
      {/* Go Back Arrow */}
      <TouchableOpacity
        style={{ position: "absolute", top: 48, left: 16, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/zencoo.png")}
          style={{ width: 210, height: 70, resizeMode: "contain" }}
        />
      </View>
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
              <TextInput
                placeholder="Create Password"
                style={[
                  styles.input,
                  { paddingRight: 40 }, // leave space for the icon
                  focusedInput === "password" && styles.inputFocused,
                ]}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
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
              <TextInput
                placeholder="Confirm Password"
                style={[
                  styles.input,
                  { paddingRight: 40 },
                  focusedInput === "confirmPassword" && styles.inputFocused,
                ]}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                secureTextEntry={!showConfirm}
                placeholderTextColor="#888"
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

            {/* Already have an account? Login */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 32,
              }}
            >
              <Text style={styles.bottomText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.bottomText, styles.bottomTextBold]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </View>
  );
}

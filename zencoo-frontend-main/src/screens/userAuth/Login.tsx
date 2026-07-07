import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import styles from "../../styles/loginStyles";
import { loginUser } from "../../api/user";
import { useAuth } from "../../context/AuthContext";
import AuthLogo from "../../components/auth/AuthLogo";
import FormField from "../../components/auth/FormField";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login({ navigation }: any) {
  const { signIn } = useAuth();
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null
  );

  return (
    <View style={styles.container}>
      <AuthLogo containerStyle={styles.logoContainer} />

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
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <FormField
              placeholder="Enter your email"
              focused={focusedInput === "email"}
              error={errors.email}
              showError={touched.email}
              styles={styles}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={(e) => {
                handleBlur("email")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              placeholder="Enter your password"
              focused={focusedInput === "password"}
              error={errors.password}
              showError={touched.password}
              styles={styles}
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={(e) => {
                handleBlur("password")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("password")}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit as any}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>

      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          Don't have an account?{" "}
          <Text
            style={styles.bottomTextBold}
            onPress={() =>
              navigation && navigation.navigate
                ? navigation.navigate("SignUpStepOne")
                : null
            }
          >
            Sign up.
          </Text>
        </Text>
      </View>
    </View>
  );
}

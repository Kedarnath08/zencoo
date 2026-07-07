import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/signupStyles";
import { checkEmailRegistered } from "../../api/user";

const SignupStepOneSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  doorNumber: Yup.string().required("Door Number is required"),
  community: Yup.string().required("Community is required"),
});

export default function SignUpStepOne({ navigation }: any) {
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

      <Formik
        initialValues={{
          fullName: "",
          email: "",
          doorNumber: "",
          community: "Sobha HRC Prestine, Jakkuru",
        }}
        validationSchema={SignupStepOneSchema}
        onSubmit={(values) => {
          navigation.navigate("SignUpStepTwo", { ...values });
        }}
        validate={async (values) => {
          const errors: any = {};
          if (await checkEmailRegistered(values.email)) {
            errors.email = "Email already registered";
          }
          return errors;
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            {/* Full Name */}
            <TextInput
              placeholder="Full Name"
              style={[
                styles.input,
                focusedInput === "fullName" && styles.inputFocused,
              ]}
              value={values.fullName}
              onChangeText={handleChange("fullName")}
              onBlur={(e) => {
                handleBlur("fullName")(e);
                setFocusedInput(null);
              }}
              placeholderTextColor="#888"
              onFocus={() => setFocusedInput("fullName")}
            />
            {touched.fullName && errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
            {/* Email */}
            <TextInput
              placeholder="Email"
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
              ]}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={(e) => {
                handleBlur("email")(e);
                setFocusedInput(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              onFocus={() => setFocusedInput("email")}
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            {/* Door Number */}
            <TextInput
              placeholder="Door Number"
              style={[
                styles.input,
                focusedInput === "doorNumber" && styles.inputFocused,
              ]}
              value={values.doorNumber}
              onChangeText={handleChange("doorNumber")}
              onBlur={(e) => {
                handleBlur("doorNumber")(e);
                setFocusedInput(null);
              }}
              placeholderTextColor="#888"
              onFocus={() => setFocusedInput("doorNumber")}
            />
            {touched.doorNumber && errors.doorNumber && (
              <Text style={styles.errorText}>{errors.doorNumber}</Text>
            )}
            {/* Community Dropdown */}
            <TextInput
              style={styles.input}
              value="Sobha HRC Prestine, Jakkuru"
              editable={false}
              placeholderTextColor="#888"
            />
            {/* Next Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit as any}
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

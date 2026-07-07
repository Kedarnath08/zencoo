import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import styles from "../../styles/signupStyles";
import { checkEmailRegistered } from "../../api/user";
import AuthLogo from "../../components/auth/AuthLogo";
import BackArrowButton from "../../components/auth/BackArrowButton";
import LoginFooterLink from "../../components/auth/LoginFooterLink";
import FormField from "../../components/auth/FormField";

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
      <BackArrowButton onPress={() => navigation.goBack()} />
      <AuthLogo containerStyle={styles.logoContainer} />

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
            <FormField
              placeholder="Full Name"
              focused={focusedInput === "fullName"}
              error={errors.fullName}
              showError={touched.fullName}
              styles={styles}
              value={values.fullName}
              onChangeText={handleChange("fullName")}
              onBlur={(e) => {
                handleBlur("fullName")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("fullName")}
            />
            <FormField
              placeholder="Email"
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
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
            />
            <FormField
              placeholder="Door Number"
              focused={focusedInput === "doorNumber"}
              error={errors.doorNumber}
              showError={touched.doorNumber}
              styles={styles}
              value={values.doorNumber}
              onChangeText={handleChange("doorNumber")}
              onBlur={(e) => {
                handleBlur("doorNumber")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("doorNumber")}
            />
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

import { Image, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { checkEmailRegistered } from "../../api/user";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import BackArrowButton from "../../components/auth/BackArrowButton";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const SignupStepOneSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  doorNumber: Yup.string().required("Door Number is required"),
  community: Yup.string().required("Community is required"),
});

export default function SignUpStepOne({ navigation }: any) {
  return (
    <View style={styles.container}>
      <BackArrowButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Image source={require("../../../assets/images/zencoo.png")} style={styles.logo} />
        <StepIndicator step={1} total={3} />
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
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <Text style={styles.headline}>Let's get to know you</Text>

            <TextField
              label="Full Name"
              placeholder="Jane Doe"
              error={touched.fullName ? errors.fullName : undefined}
              value={values.fullName}
              onChangeText={handleChange("fullName")}
              onBlur={handleBlur("fullName")}
            />
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
              label="Door Number"
              placeholder="A101"
              error={touched.doorNumber ? errors.doorNumber : undefined}
              value={values.doorNumber}
              onChangeText={handleChange("doorNumber")}
              onBlur={handleBlur("doorNumber")}
            />
            <TextField label="Community" value={values.community} locked />

            <Button title="Next" onPress={handleSubmit as any} style={{ marginTop: spacing.sm }} />
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

import { useState, useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { checkUsernameUnique, registerUser } from "../../api/user";
import { useAuth } from "../../context/AuthContext";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import BackArrowButton from "../../components/auth/BackArrowButton";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const UsernameSchema = Yup.string()
  .matches(/^@[a-zA-Z0-9_]{4,}$/, "Invalid username")
  .required("Username is required");

async function generateUsername(
  fullName: string,
  email: string
): Promise<string> {
  let base = "";
  if (fullName && fullName.trim().length > 0) {
    base = fullName.trim().replace(/\s+/g, "_").toLowerCase();
  } else if (email && email.includes("@")) {
    base = email.split("@")[0].replace(/\./g, "_").toLowerCase();
  } else {
    base = "user";
  }
  let rand = Math.floor(Math.random() * 90 + 10);
  let username = `@${base}${rand}`;
  // Try up to 100 times to find a unique username
  for (let i = 0; i < 100; i++) {
    // eslint-disable-next-line no-await-in-loop
    const isUnique = await checkUsernameUnique(username);
    if (isUnique) return username;
    rand = Math.floor(Math.random() * 90 + 10);
    username = `@${base}${rand}`;
  }
  // fallback
  return `@${base}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function SignUpStepThree({ route, navigation }: any) {
  const { signIn } = useAuth();
  const { fullName, email, doorNumber, community, password } = route.params;
  const [checking, setChecking] = useState(false);
  const [unique, setUnique] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [username, setUsername] = useState(initialUsername);

  useEffect(() => {
    setChecking(true);
    generateUsername(fullName, email).then((uname) => {
      setInitialUsername(uname);
      checkUsernameUnique(uname).then((isUnique: boolean) => {
        setUnique(isUnique);
        setValidationMsg(isUnique ? "Username is available!" : "Username not available!");
        setChecking(false);
      });
    });
  }, [fullName, email]);

  useEffect(() => {
    setValidationMsg("");
    setUnique(false);
    if (!UsernameSchema.isValidSync(username)) {
      setValidationMsg("Invalid username");
      setUnique(false);
      return;
    }
    setChecking(true);
    debouncedCheck(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const debouncedCheck = debounce(async (uname: string) => {
    const isUnique = await checkUsernameUnique(uname);
    setUnique(isUnique);
    setValidationMsg(isUnique ? "Username is available!" : "Username not available!");
    setChecking(false);
  }, 400);

  const isSuccess = unique && validationMsg === "Username is available!";

  return (
    <View style={styles.container}>
      <BackArrowButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Image source={require("../../../assets/images/zencoo.png")} style={styles.logo} />
        <StepIndicator step={3} total={3} />
      </View>

      <Formik
        enableReinitialize
        initialValues={{ username: initialUsername }}
        validateOnChange={false}
        validateOnBlur={true}
        validate={async (values) => {
          const error: any = {};
          if (!UsernameSchema.isValidSync(values.username)) {
            setValidationMsg("Invalid username");
            setUnique(false);
            error.username = "Invalid username";
            return error;
          }
          setChecking(true);
          const isUnique = await checkUsernameUnique(values.username);
          setUnique(isUnique);
          setValidationMsg(isUnique ? "Username is available!" : "Username not available!");
          setChecking(false);
          if (!isUnique) {
            error.username = "Username not available!";
          }
          return error;
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setSubmitting(true);
          const result = await registerUser({
            email,
            username: values.username,
            password,
            fullName,
            doorNumber,
            community,
          });
          setSubmitting(false);
          if (result.success && result.token) {
            await signIn(result.token);
          } else {
            setErrors({ username: result.message });
          }
        }}
      >
        {({ handleSubmit, values, errors, isSubmitting, setFieldValue, setFieldTouched }) => (
          <>
            <Text style={styles.headline}>Pick your @username</Text>

            <TextField
              label="Username"
              placeholder="@username"
              value={values.username}
              onChangeText={(text) => {
                setFieldValue("username", text);
                setUsername(text);
              }}
              onBlur={() => setFieldTouched("username", true)}
              autoCapitalize="none"
              error={!isSuccess && !checking && validationMsg ? validationMsg : undefined}
              success={isSuccess && !checking ? validationMsg : undefined}
              rightAccessory={checking ? <ActivityIndicator size="small" color={tokens.ink400} /> : undefined}
            />

            <Button
              title="Continue"
              onPress={handleSubmit as any}
              loading={isSubmitting}
              disabled={!values.username || !!errors.username || !unique || checking}
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

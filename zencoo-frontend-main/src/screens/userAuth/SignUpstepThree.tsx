import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import styles from "../../styles/signupStyles";
import { Ionicons } from "@expo/vector-icons";
import { checkUsernameUnique, registerUser } from "../../api/user";
import { useAuth } from "../../context/AuthContext";

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
  const [validationColor, setValidationColor] = useState("#888");
  const [initialUsername, setInitialUsername] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [username, setUsername] = useState(initialUsername);

  useEffect(() => {
    setChecking(true);
    generateUsername(fullName, email).then((uname) => {
      setInitialUsername(uname);
      checkUsernameUnique(uname).then((isUnique: boolean) => {
        setUnique(isUnique);
        setValidationMsg(
          isUnique ? "Username is available!" : "Username not available!"
        );
        setValidationColor(isUnique ? "green" : "red");
        setChecking(false);
      });
    });
  }, [fullName, email]);

  useEffect(() => {
    setValidationMsg("");
    setUnique(false);
    if (!UsernameSchema.isValidSync(username)) {
      setValidationMsg("Invalid username");
      setValidationColor("red");
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
    setValidationMsg(
      isUnique ? "Username is available!" : "Username not available!"
    );
    setValidationColor(isUnique ? "green" : "red");
    setChecking(false);
  }, 400);

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
      <Text style={{ fontSize: 18, marginBottom: 16, textAlign: "center" }}>
        Pick your <Text style={{ fontWeight: "bold" }}>@username</Text>
      </Text>
      <Formik
        enableReinitialize
        initialValues={{ username: initialUsername }}
        validateOnChange={false}
        validateOnBlur={true}
        validate={async (values) => {
          let error: any = {};
          if (!UsernameSchema.isValidSync(values.username)) {
            setValidationMsg("Invalid username");
            setValidationColor("red");
            setUnique(false);
            error.username = "Invalid username";
            return error;
          }
          setChecking(true);
          const isUnique = await checkUsernameUnique(values.username);
          setUnique(isUnique);
          setValidationMsg(
            isUnique ? "Username is available!" : "Username not available!"
          );
          setValidationColor(isUnique ? "green" : "red");
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
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          setFieldTouched,
          setFieldValue,
        }) => (
          <>
            <TextInput
              placeholder="@username"
              style={[
                styles.input,
                focusedInput === "userName" && styles.inputFocused,
              ]}
              value={values.username}
              onChangeText={(text) => {
                setFieldValue("username", text);
                setUsername(text); // update local state for debounce
              }}
              onBlur={() => setFieldTouched("username", true)}
              onFocus={() => setFocusedInput("userName")}
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            {checking && <ActivityIndicator size="small" />}
            {validationMsg !== "" && (
              <Text style={{ color: validationColor, marginTop: 4 }}>
                {validationMsg}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!values.username ||
                  !!errors.username ||
                  !unique ||
                  isSubmitting ||
                  checking) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit as any}
              disabled={
                !values.username ||
                !!errors.username ||
                !unique ||
                isSubmitting ||
                checking
              }
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
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

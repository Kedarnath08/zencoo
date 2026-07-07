import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/signupStyles";
import AuthLogo from "../../components/auth/AuthLogo";
import LoginFooterLink from "../../components/auth/LoginFooterLink";

export default function WelcomePage({ navigation }: any) {
  return (
    <View style={styles.container}>
      <AuthLogo containerStyle={styles.logoContainer} />
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 32 }}>
        Welcome to Zencoo! Connect with your community, stay updated, and enjoy
        a seamless living experience.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SignUpStepOne")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <LoginFooterLink onPress={() => navigation.navigate("Login")} styles={styles} />
    </View>
  );
}

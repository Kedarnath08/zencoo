import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../../styles/signupStyles";

export default function WelcomePage({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/zencoo.png")}
          style={{ width: 210, height: 70, resizeMode: "contain" }}
        />
      </View>
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
          <Text style={[styles.bottomText, styles.bottomTextBold]}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

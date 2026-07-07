import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View } from "react-native";

interface LoginFooterLinkProps {
  onPress: () => void;
  styles: {
    bottomText: StyleProp<TextStyle>;
    bottomTextBold: StyleProp<TextStyle>;
  };
}

/** "Already have an account? Login" footer shared by Welcome + sign-up steps. */
const LoginFooterLink: React.FC<LoginFooterLinkProps> = ({ onPress, styles }) => (
  <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 32 }}>
    <Text style={styles.bottomText}>Already have an account? </Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.bottomText, styles.bottomTextBold]}>Login</Text>
    </TouchableOpacity>
  </View>
);

export default LoginFooterLink;

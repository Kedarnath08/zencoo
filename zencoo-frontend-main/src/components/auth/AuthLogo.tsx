import React from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";

interface AuthLogoProps {
  containerStyle: StyleProp<ViewStyle>;
}

/** Zencoo wordmark logo used on every auth screen. */
const AuthLogo: React.FC<AuthLogoProps> = ({ containerStyle }) => (
  <View style={containerStyle}>
    <Image
      source={require("../../../assets/images/zencoo.png")}
      style={{ width: 210, height: 70, resizeMode: "contain" }}
    />
  </View>
);

export default AuthLogo;

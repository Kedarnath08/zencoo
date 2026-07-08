import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomePage from "../screens/userAuth/WelcomePage";
import SignUpStepOne from "../screens/userAuth/SignUpStepOne";
import SignUpStepTwo from "../screens/userAuth/SignUpStepTwo";
import SignUpStepThree from "../screens/userAuth/SignUpstepThree";
import Login from "../screens/userAuth/Login";
import CompleteGoogleProfile from "../screens/userAuth/google/CompleteGoogleProfile";
import AppNavigator from "./AppNavigator";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated, ready } = useAuth();

  // While the persisted token is read on boot, show a splash so we don't flash
  // the login screen for an already-logged-in user.
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WelcomePage" component={WelcomePage} />
          <Stack.Screen name="SignUpStepOne" component={SignUpStepOne} />
          <Stack.Screen name="SignUpStepTwo" component={SignUpStepTwo} />
          <Stack.Screen name="SignUpStepThree" component={SignUpStepThree} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="CompleteGoogleProfile" component={CompleteGoogleProfile} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

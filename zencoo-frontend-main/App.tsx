import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import AuthNavigator from "./src/navigation/AuthNavigator"; // <-- use AuthNavigator
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  const setNavBar = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setBackgroundColorAsync("#ffffff");
      await NavigationBar.setButtonStyleAsync("dark");
      await NavigationBar.setBehaviorAsync("inset-swipe");
    }
  };

  useEffect(() => {
    setNavBar();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNavBar();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <AuthNavigator />
    </AuthProvider>
  );
}

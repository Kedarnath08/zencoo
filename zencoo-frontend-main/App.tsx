import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { queryClient } from "./src/api/queryClient";

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
      focusManager.setFocused(state === "active");
      if (state === "active") {
        setNavBar();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

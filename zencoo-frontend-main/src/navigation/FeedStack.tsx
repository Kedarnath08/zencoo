import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Feed from "../screens/Feed";
import NotificationsScreen from "../screens/Notifications";

export type FeedStackParamList = {
  FeedMain: undefined;
  Notifications: undefined;
  PostDetail?: { postId: number };
  OthersProfile?: { id: string };
  Orders?: {};
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

const FeedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FeedMain" component={Feed} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

export default FeedStack;

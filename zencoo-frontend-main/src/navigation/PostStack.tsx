import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostPreviewScreen from "../screens/posting/PostingScreen";

export type PostStackParamList = {
  PostPreview: undefined;
};

const Stack = createNativeStackNavigator<PostStackParamList>();

const PostStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PostPreview" component={PostPreviewScreen} />
  </Stack.Navigator>
);

export default PostStack;

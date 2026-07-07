import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyProfileScreen from "../screens/userProfile/MyProfile";
import OthersProfileScreen from "../screens/userProfile/OthersProfile";
import PostDetail from "../screens/PostDetail";
import FollowList from "../screens/FollowList";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  OthersProfile: {
    id: string;
    displayName: string;
    username: string;
    wing: string;
    door: string;
  };
  PostDetail: { postId: number; isOwn?: boolean };
  FollowList: { userId: number; initialTab?: "followers" | "following" };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={MyProfileScreen} />
    <Stack.Screen name="OthersProfile" component={OthersProfileScreen} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="FollowList" component={FollowList} />
  </Stack.Navigator>
);

export default ProfileStack;

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ResidentsStack from "./ResidentsStack";
import FeedStack from "./FeedStack";
import BottomNavBar from "../components/BottomNavBar";
import ProfileStack from "./ProfileStack";
import PostStack from "./PostStack";
import Orders from "../screens/Orders";

// Update tab param list
export type AppTabParamList = {
  Feed: undefined;
  Residents: undefined;
  NewPost: undefined;
  Orders: undefined;
  Myprofile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Feed"
      tabBar={(props) => <BottomNavBar {...props} />}
    >
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen name="Residents" component={ResidentsStack} />
      <Tab.Screen name="NewPost" component={PostStack} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Myprofile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

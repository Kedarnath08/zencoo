import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Orders from "../screens/orders/Orders";
import OrderDetail from "../screens/orders/OrderDetail";
import OthersProfileScreen from "../screens/userProfile/OthersProfile";

export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetail: { orderId: number; role: "placed" | "received" };
  OthersProfile: { id: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersMain" component={Orders} />
    <Stack.Screen name="OrderDetail" component={OrderDetail} />
    <Stack.Screen name="OthersProfile" component={OthersProfileScreen} />
  </Stack.Navigator>
);

export default OrdersStack;

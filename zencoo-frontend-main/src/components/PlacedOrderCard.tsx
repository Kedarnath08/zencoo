import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Order } from "../api/orders";
import { formatDateTime } from "../utils/time";

const placeholder = require("../../assets/images/profile-placeholder.jpg");

const PlacedOrderCard = ({
  order,
  onSellerPress,
  onCancel,
}: {
  order: Order;
  onSellerPress: (sellerId: number) => void;
  onCancel?: () => void;
}) => (
  <View style={styles.card}>
    {/* X button for pending orders */}
    {order.status === "PENDING" && onCancel && (
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        hitSlop={10}
      >
        <MaterialCommunityIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    )}
    <Image
      source={order.productImage ? { uri: order.productImage } : placeholder}
      style={styles.productImage}
    />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.productName}>{order.productName}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>By: </Text>
        <Pressable onPress={() => onSellerPress(order.sellerId)}>
          <Text style={styles.sellerName}>{order.sellerName}</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Quantity: </Text>
        <Text style={styles.value}>{order.quantity}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Placed on: </Text>
        <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status: </Text>
        <Text style={styles.value}>{order.status}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "flex-start",
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: "#888",
    fontWeight: "bold",
  },
  value: {
    fontSize: 15,
    color: "#444",
  },
  sellerName: {
    fontSize: 16,
    color: "#FF8C00",
    fontWeight: "bold",
  },
  cancelBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#B0B0B0",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },
});

export default PlacedOrderCard;

import React from "react";
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Order } from "../api/orders";
import { formatDateTime } from "../utils/time";
import { formatPrice } from "../utils/currency";
import { ORDER_STATUS_TONE } from "../utils/orderStatus";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

const placeholder = require("../../assets/images/profile-placeholder.jpg");

const PlacedOrderCard = ({
  order,
  onPress,
  onSellerPress,
  onCancel,
}: {
  order: Order;
  onPress?: () => void;
  onSellerPress: (sellerId: number) => void;
  onCancel?: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1} disabled={!onPress}>
    <Card style={styles.card}>
      {order.status === "PENDING" && onCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      <Image
        source={order.productImage ? { uri: order.productImage } : placeholder}
        style={styles.productImage}
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
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
        {order.unitPrice > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Total: </Text>
            <Text style={styles.value}>{formatPrice(order.totalPrice)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Placed on: </Text>
          <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <Badge
          label={order.status}
          tone={ORDER_STATUS_TONE[order.status]}
          style={{ marginTop: spacing.xs }}
        />
      </View>
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    alignItems: "flex-start",
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: tokens.canvas,
  },
  productName: {
    ...typography.heading,
    color: tokens.ink900,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    ...typography.body,
    color: tokens.ink600,
  },
  value: {
    ...typography.body,
    color: tokens.ink900,
  },
  sellerName: {
    ...typography.heading,
    color: tokens.primary,
  },
  cancelBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: tokens.ink400,
    borderRadius: radius.md,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});

export default PlacedOrderCard;

import React from "react";
import { View, Text, Image, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Order } from "../api/orders";
import { formatDateTime } from "../utils/time";
import { formatPrice } from "../utils/currency";
import { ORDER_STATUS_TONE } from "../utils/orderStatus";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

const placeholder = require("../../assets/images/profile-placeholder.jpg");

const ReceivedOrderCard = ({
  order,
  onPress,
  onCustomerPress,
  onAccept,
  onReject,
  onComplete,
  onCancel,
}: {
  order: Order;
  onPress?: () => void;
  onCustomerPress: (customerId: number) => void;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1} disabled={!onPress}>
    <Card style={styles.card}>
      <Image
        source={order.productImage ? { uri: order.productImage } : placeholder}
        style={styles.productImage}
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <View style={styles.row}>
          <Text style={styles.label}>Customer: </Text>
          <Pressable onPress={() => onCustomerPress(order.buyerId)}>
            <Text style={styles.customerName}>{order.buyerName}</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Product: </Text>
          <Text style={styles.productValue}>{order.productName}</Text>
        </View>
        {order.note ? (
          <View style={styles.row}>
            <Text style={styles.label}>Note: </Text>
            <Text style={styles.value}>{order.note}</Text>
          </View>
        ) : null}
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
          <Text style={styles.label}>Placed: </Text>
          <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
        </View>

        {order.status === "PENDING" && (
          <View style={styles.actionRow}>
            <Button title="Accept" onPress={onAccept} style={styles.actionBtn} />
            <Button title="Reject" onPress={onReject} variant="destructive" style={styles.actionBtn} />
          </View>
        )}
        {order.status === "ACCEPTED" && (
          <View style={styles.actionRow}>
            <Button title="Completed" onPress={onComplete} style={styles.actionBtn} />
            <Button title="Cancel" onPress={onCancel} variant="destructive" style={styles.actionBtn} />
          </View>
        )}
        {(order.status === "COMPLETED" ||
          order.status === "REJECTED" ||
          order.status === "CANCELLED") && (
          <Badge
            label={order.status}
            tone={ORDER_STATUS_TONE[order.status]}
            style={{ marginTop: spacing.xs }}
          />
        )}
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
  productValue: {
    ...typography.body,
    fontWeight: "700",
    color: tokens.ink900,
  },
  customerName: {
    ...typography.heading,
    color: tokens.primary,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.sm,
  },
});

export default ReceivedOrderCard;

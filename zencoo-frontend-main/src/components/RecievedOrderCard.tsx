import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Order } from "../api/orders";
import { formatDateTime } from "../utils/time";
import { formatPrice } from "../utils/currency";

const placeholder = require("../../assets/images/profile-placeholder.jpg");

const LEAF_GREEN = "#43A047"; // Leaf green
const RED = "#F44336";

const statusColors: Record<string, string> = {
  PENDING: LEAF_GREEN,
  ACCEPTED: LEAF_GREEN,
  COMPLETED: LEAF_GREEN,
  REJECTED: RED,
  CANCELLED: RED,
};

const StatusBadge = ({ status }: { status: string }) => (
  <View
    style={[
      styles.statusBadge,
      { backgroundColor: statusColors[status] || "#ccc" },
    ]}
  >
    <Text style={styles.statusBadgeText}>{status}</Text>
  </View>
);

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
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={onPress ? 0.8 : 1}
    disabled={!onPress}
  >
    <Image
      source={order.productImage ? { uri: order.productImage } : placeholder}
      style={styles.productImage}
    />
    <View style={{ flex: 1, marginLeft: 12 }}>
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
      {/* Action Buttons or Status Badge */}
      {order.status === "PENDING" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: LEAF_GREEN }]}
            onPress={onAccept}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: RED }]}
            onPress={onReject}
          >
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      {order.status === "ACCEPTED" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: LEAF_GREEN }]}
            onPress={onComplete}
          >
            <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: RED }]}
            onPress={onCancel}
          >
            <MaterialCommunityIcons name="cancel" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {(order.status === "COMPLETED" ||
        order.status === "REJECTED" ||
        order.status === "CANCELLED") && <StatusBadge status={order.status} />}
    </View>
  </TouchableOpacity>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: "#888", // lighter grey for label
    fontWeight: "bold",
  },
  value: {
    fontSize: 15,
    color: "#444",
  },
  productValue: {
    fontSize: 15,
    color: "#444",
    fontWeight: "bold",
  },
  customerName: {
    fontSize: 18,
    color: "#FF8C00",
    fontWeight: "bold",
  },
  noteText: {
    color: "#555",
    fontStyle: "italic",
    fontSize: 14,
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10, // If gap doesn't work, use justifyContent: "space-between"
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 24, // Increased for more rounded buttons
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ReceivedOrderCard;

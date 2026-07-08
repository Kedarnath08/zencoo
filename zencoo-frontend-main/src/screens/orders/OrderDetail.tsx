import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrdersStackParamList } from "../../navigation/OrdersStack";
import { fetchOrder, type Order } from "../../api/orders";
import { formatDateTime } from "../../utils/time";
import { formatPrice } from "../../utils/currency";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import { queryKeys } from "../../api/queryKeys";
import ScreenHeader from "../../components/ScreenHeader";
import LoadingView from "../../components/LoadingView";
import StatusBadge from "../../components/StatusBadge";
import { colors } from "../../theme/colors";

const placeholder = require("../../../assets/images/profile-placeholder.jpg");

const LEAF_GREEN = colors.success;
const RED = colors.danger;

type Params = { orderId: number; role: "placed" | "received" };

const STEPS: { key: string; label: string }[] = [
  { key: "PENDING", label: "Placed" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "COMPLETED", label: "Completed" },
];

const OrderDetail: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const route = useRoute();
  const { orderId, role } = route.params as Params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const orderQuery = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => fetchOrder(orderId),
  });
  useRefreshOnFocus(() => {
    qc.invalidateQueries({ queryKey: queryKeys.order(orderId) });
  });

  const order = orderQuery.data ?? null;
  const loading = orderQuery.isPending;

  const updateStatus = useUpdateOrderStatus();
  const busy = updateStatus.isPending;

  const changeStatus = (status: Order["status"]) => {
    if (busy) return;
    updateStatus.mutate(
      { orderId, status },
      {
        onError: (err: any) =>
          Alert.alert(
            "Update failed",
            err?.response?.data?.message ?? "Please try again."
          ),
      }
    );
  };

  const confirmCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: () => changeStatus("CANCELLED") },
    ]);
  };

  const goToProfile = (userId: number) => {
    navigation.navigate("OthersProfile", { id: userId.toString() });
  };

  if (loading) {
    return (
      <View style={[local.container, local.centered]}>
        <LoadingView />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[local.container, local.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={local.backFloating}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#444" />
        </TouchableOpacity>
        <Text style={{ color: "#888" }}>This order is no longer available.</Text>
      </View>
    );
  }

  const isTerminalNegative =
    order.status === "REJECTED" || order.status === "CANCELLED";
  const counterpartyId = role === "placed" ? order.sellerId : order.buyerId;
  const counterpartyName = role === "placed" ? order.sellerName : order.buyerName;
  const counterpartyLabel = role === "placed" ? "Seller" : "Buyer";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <View style={[local.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Order Details"
        onBack={() => navigation.goBack()}
        iconSize={26}
        style={local.header}
        titleStyle={local.headerTitle}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={local.productCard}>
          <Image
            source={order.productImage ? { uri: order.productImage } : placeholder}
            style={local.productImage}
          />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={local.productName}>{order.productName}</Text>
            <Text style={local.qtyText}>Qty: {order.quantity}</Text>
            {order.unitPrice > 0 ? (
              <>
                <Text style={local.priceLine}>
                  {formatPrice(order.unitPrice)} × {order.quantity}
                </Text>
                <Text style={local.totalPrice}>
                  Total: {formatPrice(order.totalPrice)}
                </Text>
              </>
            ) : (
              <Text style={local.priceLine}>No price set</Text>
            )}
          </View>
        </View>

        {/* Status timeline */}
        <View style={local.section}>
          {isTerminalNegative ? (
            <StatusBadge
              status={order.status}
              label={`Order ${order.status}`}
              icon={<Ionicons name="close-circle" size={18} color="#fff" />}
              style={local.terminalBadge}
              textStyle={local.terminalBadgeText}
            />
          ) : (
            <View style={local.timeline}>
              {STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    {i > 0 && (
                      <View
                        style={[
                          local.timelineLine,
                          done && { backgroundColor: LEAF_GREEN },
                        ]}
                      />
                    )}
                    <View style={local.timelineStep}>
                      <View
                        style={[
                          local.timelineDot,
                          done && { backgroundColor: LEAF_GREEN },
                        ]}
                      >
                        {done && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text
                        style={[
                          local.timelineLabel,
                          done && { color: LEAF_GREEN, fontWeight: "bold" },
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </View>

        {/* Counterparty */}
        <View style={local.section}>
          <Text style={local.sectionLabel}>{counterpartyLabel}</Text>
          <TouchableOpacity onPress={() => goToProfile(counterpartyId)}>
            <Text style={local.linkText}>{counterpartyName}</Text>
          </TouchableOpacity>
        </View>

        {order.note ? (
          <View style={local.section}>
            <Text style={local.sectionLabel}>Note</Text>
            <Text style={local.noteText}>{order.note}</Text>
          </View>
        ) : null}

        <View style={local.section}>
          <Text style={local.sectionLabel}>Placed</Text>
          <Text style={local.value}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <View style={local.section}>
          <Text style={local.sectionLabel}>Last updated</Text>
          <Text style={local.value}>{formatDateTime(order.updatedAt)}</Text>
        </View>

        {/* Actions */}
        {role === "received" && order.status === "PENDING" && (
          <View style={local.actionRow}>
            <TouchableOpacity
              style={[local.actionBtn, { backgroundColor: LEAF_GREEN }]}
              onPress={() => changeStatus("ACCEPTED")}
              disabled={busy}
            >
              <Icon name="check" size={20} color="#fff" />
              <Text style={local.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[local.actionBtn, { backgroundColor: RED }]}
              onPress={() => changeStatus("REJECTED")}
              disabled={busy}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text style={local.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {role === "received" && order.status === "ACCEPTED" && (
          <View style={local.actionRow}>
            <TouchableOpacity
              style={[local.actionBtn, { backgroundColor: LEAF_GREEN }]}
              onPress={() => changeStatus("COMPLETED")}
              disabled={busy}
            >
              <Icon name="check-all" size={20} color="#fff" />
              <Text style={local.actionBtnText}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[local.actionBtn, { backgroundColor: RED }]}
              onPress={confirmCancel}
              disabled={busy}
            >
              <Icon name="cancel" size={20} color="#fff" />
              <Text style={local.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {role === "placed" && order.status === "PENDING" && (
          <View style={local.actionRow}>
            <TouchableOpacity
              style={[local.actionBtn, { backgroundColor: RED }]}
              onPress={confirmCancel}
              disabled={busy}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text style={local.actionBtnText}>Cancel order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5ECF6",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  backFloating: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  qtyText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  priceLine: {
    fontSize: 15,
    color: "#444",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  linkText: {
    fontSize: 17,
    color: "#FF8C00",
    fontWeight: "bold",
  },
  noteText: {
    fontSize: 15,
    color: "#444",
    fontStyle: "italic",
  },
  value: {
    fontSize: 15,
    color: "#444",
  },
  terminalBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  terminalBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineStep: {
    alignItems: "center",
    width: 72,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#ccc",
    marginTop: 12,
    marginHorizontal: -8,
  },
  timelineLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
});

export default OrderDetail;

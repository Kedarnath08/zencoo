import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrdersStackParamList } from "../../navigation/OrdersStack";
import { fetchOrder, type Order } from "../../api/orders";
import { formatDateTime } from "../../utils/time";
import { formatPrice } from "../../utils/currency";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import { queryKeys } from "../../api/queryKeys";
import { ORDER_STATUS_TONE } from "../../utils/orderStatus";
import ScreenHeader from "../../components/ScreenHeader";
import LoadingView from "../../components/LoadingView";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { radius, spacing } from "../../theme/spacing";

const placeholder = require("../../../assets/images/profile-placeholder.jpg");

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
      <View style={[styles.container, styles.centered]}>
        <LoadingView />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backFloating} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={tokens.ink600} />
        </TouchableOpacity>
        <Text style={{ color: tokens.ink600 }}>This order is no longer available.</Text>
      </View>
    );
  }

  const isTerminalNegative = order.status === "REJECTED" || order.status === "CANCELLED";
  const counterpartyId = role === "placed" ? order.sellerId : order.buyerId;
  const counterpartyName = role === "placed" ? order.sellerName : order.buyerName;
  const counterpartyLabel = role === "placed" ? "Seller" : "Buyer";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Order Details"
        onBack={() => navigation.goBack()}
        iconSize={26}
        style={styles.header}
        titleStyle={styles.headerTitle}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Card style={styles.productCard}>
          <Image
            source={order.productImage ? { uri: order.productImage } : placeholder}
            style={styles.productImage}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.productName}>{order.productName}</Text>
            <Text style={styles.qtyText}>Qty: {order.quantity}</Text>
            {order.unitPrice > 0 ? (
              <>
                <Text style={styles.priceLine}>
                  {formatPrice(order.unitPrice)} × {order.quantity}
                </Text>
                <Text style={styles.totalPrice}>Total: {formatPrice(order.totalPrice)}</Text>
              </>
            ) : (
              <Text style={styles.priceLine}>No price set</Text>
            )}
          </View>
        </Card>

        {/* Status timeline */}
        <Card style={styles.section}>
          {isTerminalNegative ? (
            <Badge
              label={`Order ${order.status}`}
              tone={ORDER_STATUS_TONE[order.status]}
              icon={<Ionicons name="close-circle" size={18} color="#fff" />}
            />
          ) : (
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    {i > 0 && (
                      <View
                        style={[styles.timelineLine, done && { backgroundColor: tokens.success }]}
                      />
                    )}
                    <View style={styles.timelineStep}>
                      <View
                        style={[styles.timelineDot, done && { backgroundColor: tokens.success }]}
                      >
                        {done && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text
                        style={[
                          styles.timelineLabel,
                          done && { color: tokens.success, fontWeight: "bold" },
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
        </Card>

        {/* Counterparty */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>{counterpartyLabel}</Text>
          <TouchableOpacity onPress={() => goToProfile(counterpartyId)}>
            <Text style={styles.linkText}>{counterpartyName}</Text>
          </TouchableOpacity>
        </Card>

        {order.note ? (
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Note</Text>
            <Text style={styles.noteText}>{order.note}</Text>
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Placed</Text>
          <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
        </Card>
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Last updated</Text>
          <Text style={styles.value}>{formatDateTime(order.updatedAt)}</Text>
        </Card>

        {/* Actions */}
        {role === "received" && order.status === "PENDING" && (
          <View style={styles.actionRow}>
            <Button title="Accept" onPress={() => changeStatus("ACCEPTED")} disabled={busy} style={styles.actionBtn} />
            <Button title="Reject" onPress={() => changeStatus("REJECTED")} disabled={busy} variant="destructive" style={styles.actionBtn} />
          </View>
        )}
        {role === "received" && order.status === "ACCEPTED" && (
          <View style={styles.actionRow}>
            <Button title="Completed" onPress={() => changeStatus("COMPLETED")} disabled={busy} style={styles.actionBtn} />
            <Button title="Cancel" onPress={confirmCancel} disabled={busy} variant="destructive" style={styles.actionBtn} />
          </View>
        )}
        {role === "placed" && order.status === "PENDING" && (
          <View style={styles.actionRow}>
            <Button title="Cancel order" onPress={confirmCancel} disabled={busy} variant="destructive" style={styles.actionBtn} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.canvas,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: tokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
  },
  headerTitle: {
    ...typography.heading,
    color: tokens.ink900,
  },
  productCard: {
    flexDirection: "row",
    margin: spacing.lg,
    marginBottom: spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: tokens.canvas,
  },
  productName: {
    ...typography.heading,
    color: tokens.ink900,
    marginBottom: spacing.xs,
  },
  qtyText: {
    ...typography.caption,
    color: tokens.ink600,
    marginBottom: spacing.xs,
  },
  priceLine: {
    ...typography.body,
    color: tokens.ink900,
  },
  totalPrice: {
    ...typography.heading,
    color: tokens.primary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: tokens.ink600,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  linkText: {
    ...typography.heading,
    color: tokens.primary,
  },
  noteText: {
    ...typography.body,
    color: tokens.ink900,
    fontStyle: "italic",
  },
  value: {
    ...typography.body,
    color: tokens.ink900,
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
    backgroundColor: tokens.line,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  timelineLine: {
    flex: 1,
    height: 3,
    backgroundColor: tokens.line,
    marginTop: 12,
    marginHorizontal: -8,
  },
  timelineLabel: {
    ...typography.caption,
    color: tokens.ink600,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 46,
  },
});

export default OrderDetail;

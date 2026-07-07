import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles/ordersStyles";
import PlacedOrderCard from "../components/PlacedOrderCard";
import ReceivedOrderCard from "../components/RecievedOrderCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChecklistIcon from "../../assets/icons/list.svg";
import {
  fetchPlacedOrders,
  fetchReceivedOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../api/orders";

// Sort received orders: PENDING first, then ACCEPTED, then the rest; newest first within a group.
const receivedStatusRank = (status: OrderStatus) => {
  if (status === "PENDING") return 0;
  if (status === "ACCEPTED") return 1;
  return 2;
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"placed" | "received">("placed");
  const [placed, setPlaced] = useState<Order[]>([]);
  const [received, setReceived] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        fetchPlacedOrders(),
        fetchReceivedOrders(),
      ]);
      setPlaced(p);
      setReceived(r);
    } catch (err) {
      Alert.alert("Couldn't load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const applyUpdated = (updated: Order) => {
    setPlaced((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setReceived((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  };

  const changeStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      applyUpdated(updated);
    } catch (err: any) {
      Alert.alert(
        "Update failed",
        err?.response?.data?.message ?? "Please try again."
      );
    }
  };

  const confirmCancelPlaced = (orderId: number) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => changeStatus(orderId, "CANCELLED"),
      },
    ]);
  };

  const renderPlaced = () => {
    const sorted = [...placed].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return (
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlacedOrderCard
            order={item}
            onSellerPress={() => {}}
            onCancel={
              item.status === "PENDING"
                ? () => confirmCancelPlaced(item.id)
                : undefined
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(80, insets.bottom + 48) },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No placed orders.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderReceived = () => {
    const sorted = [...received].sort((a, b) => {
      const diff = receivedStatusRank(a.status) - receivedStatusRank(b.status);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return (
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReceivedOrderCard
            order={item}
            onCustomerPress={() => {}}
            onAccept={() => changeStatus(item.id, "ACCEPTED")}
            onReject={() => changeStatus(item.id, "REJECTED")}
            onComplete={() => changeStatus(item.id, "COMPLETED")}
            onCancel={() => changeStatus(item.id, "CANCELLED")}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(100, insets.bottom + 60) },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No received orders.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E5ECF6" }}>
      {/* Header with shadow */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <View style={styles.plusBorder}>
          <ChecklistIcon width={26} height={26} color="#222" />
        </View>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "placed" && styles.activeTab]}
          onPress={() => setActiveTab("placed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "placed" && styles.activeTabText,
            ]}
          >
            Placed orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText,
            ]}
          >
            Received orders
          </Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF8C00"
            style={{ marginTop: 32 }}
          />
        ) : activeTab === "placed" ? (
          renderPlaced()
        ) : (
          renderReceived()
        )}
      </View>
    </View>
  );
};

export default Orders;

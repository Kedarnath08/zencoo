import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { OrdersStackParamList } from "../../navigation/OrdersStack";
import styles from "../../styles/ordersStyles";
import PlacedOrderCard from "../../components/PlacedOrderCard";
import ReceivedOrderCard from "../../components/RecievedOrderCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChecklistIcon from "../../../assets/icons/list.svg";
import {
  fetchPlacedOrders,
  fetchReceivedOrders,
  type OrderStatus,
} from "../../api/orders";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import { queryKeys } from "../../api/queryKeys";
import LoadingView from "../../components/LoadingView";
import { tokens } from "../../theme/colors";

const PAGE_SIZE = 20;

// Sort received orders: PENDING first, then ACCEPTED, then the rest; newest first within a group.
const receivedStatusRank = (status: OrderStatus) => {
  if (status === "PENDING") return 0;
  if (status === "ACCEPTED") return 1;
  return 2;
};

const Orders = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const [activeTab, setActiveTab] = useState<"placed" | "received">("placed");
  const insets = useSafeAreaInsets();

  const placedQuery = useInfiniteQuery({
    queryKey: queryKeys.ordersPlaced(),
    queryFn: ({ pageParam }) => fetchPlacedOrders(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });

  const receivedQuery = useInfiniteQuery({
    queryKey: queryKeys.ordersReceived(),
    queryFn: ({ pageParam }) => fetchReceivedOrders(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });

  useRefreshOnFocus(() => {
    placedQuery.refetch();
    receivedQuery.refetch();
  });

  // Show one combined alert (not one per list) whenever either list enters
  // an error state, matching the prior hadErrorRef-based behavior.
  const hadErrorRef = useRef(false);
  useEffect(() => {
    const hasError = placedQuery.isError || receivedQuery.isError;
    if (hasError && !hadErrorRef.current) {
      Alert.alert("Couldn't load orders. Please try again.");
    }
    hadErrorRef.current = hasError;
  }, [placedQuery.isError, receivedQuery.isError]);

  const loading = placedQuery.isPending || receivedQuery.isPending;
  const placed = placedQuery.data?.pages.flat() ?? [];
  const received = receivedQuery.data?.pages.flat() ?? [];

  const updateStatus = useUpdateOrderStatus();

  const changeStatus = (orderId: number, status: OrderStatus) => {
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
            onPress={() =>
              navigation.navigate("OrderDetail", {
                orderId: item.id,
                role: "placed",
              })
            }
            onSellerPress={(sellerId) =>
              navigation.navigate("OthersProfile", { id: sellerId.toString() })
            }
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
        onEndReached={() => {
          if (placedQuery.hasNextPage && !placedQuery.isFetchingNextPage) {
            placedQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          placedQuery.isFetchingNextPage ? (
            <LoadingView style={{ marginVertical: 16 }} />
          ) : null
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
            onPress={() =>
              navigation.navigate("OrderDetail", {
                orderId: item.id,
                role: "received",
              })
            }
            onCustomerPress={(customerId) =>
              navigation.navigate("OthersProfile", { id: customerId.toString() })
            }
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
        onEndReached={() => {
          if (receivedQuery.hasNextPage && !receivedQuery.isFetchingNextPage) {
            receivedQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          receivedQuery.isFetchingNextPage ? (
            <LoadingView style={{ marginVertical: 16 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.canvas }}>
      {/* Header with shadow */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <View style={styles.plusBorder}>
          <ChecklistIcon width={26} height={26} color={tokens.ink900} />
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
          <LoadingView style={{ marginTop: 32 }} />
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

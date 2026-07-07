import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ResidentsStackParamList } from "../../navigation/ResidentsStack";
import styles from "../../styles/residentsStyles";
import { fetchResidents, type Resident } from "../../api/residents";
import ScreenHeader from "../../components/ScreenHeader";
import ResidentListItem from "../../components/ResidentListItem";
import LoadingView from "../../components/LoadingView";
import { usePaginatedList } from "../../hooks/usePaginatedList";

const NAV_HEIGHT = 64;

type ResidentsRouteParams = {
  wing: { label: string; value: string };
};

type NavigationProp = NativeStackNavigationProp<
  ResidentsStackParamList,
  "ResidentsList"
>;

const Residents = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { wing } = route.params as ResidentsRouteParams;

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const insets = useSafeAreaInsets();

  // Load residents for the selected wing from the backend.
  const fetchResidentsPage = useCallback(
    (page: number, size: number) => fetchResidents(wing.value, page, size),
    [wing.value]
  );
  const { items: residents, loading, loadingMore, hasMore, reset, loadMore } =
    usePaginatedList<Resident>(fetchResidentsPage, 20);

  useEffect(() => {
    reset();
  }, [reset]);

  // 3. Type the filter callback
  const filteredResidents = residents.filter(
    (r) =>
      r.displayName.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase()) ||
      r.wing.toLowerCase().includes(search.toLowerCase()) ||
      r.door.toLowerCase().includes(search.toLowerCase())
  );

  // Header height (56 is standard app bar height)
  const headerHeight = insets.top + 56;

  return (
    <View style={styles.container}>
      {/* Full-width, full-top header with shadow */}
      <ScreenHeader
        title={wing.label}
        onBack={() => navigation.goBack()}
        style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}
        titleStyle={styles.headerTitle}
        backButtonStyle={styles.backBtn}
        right={null}
      />
      {/* Main content, padded below header */}
      <View
        style={{
          flex: 1,
          paddingTop: headerHeight,
          paddingHorizontal: 16,
        }}
      >
        <>
          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchBar,
              { marginTop: 12 },
              searchFocused && styles.searchBarFocused,
            ]}
            placeholder="Search Resident"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#888"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {/* Residents List */}
          <FlatList
            data={filteredResidents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              paddingBottom: insets.bottom + NAV_HEIGHT + 12,
            }}
            renderItem={({ item }) => (
              <ResidentListItem
                displayName={item.displayName}
                username={item.username}
                wing={item.wing}
                door={item.door}
                profilePic={item.profilePic}
                onPress={() =>
                  navigation.push("OthersProfile", { id: String(item.id) })
                }
              />
            )}
            ListEmptyComponent={
              loading ? (
                <LoadingView style={{ marginTop: 32 }} />
              ) : (
                <Text style={styles.noResults}>No residents found.</Text>
              )
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? <LoadingView style={{ marginVertical: 16 }} /> : null
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      </View>
    </View>
  );
};

export default Residents;

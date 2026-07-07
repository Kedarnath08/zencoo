import React from "react";
import { FlatList, TouchableOpacity, Text, View } from "react-native";
import ResidentsIcon from "../../../../assets/icons/Residents.svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../../styles/wingsStyles";

const WINGS = [
  { label: "Wing 1", value: "1" },
  { label: "Wing 2", value: "2" },
  { label: "Wing 3", value: "3" },
  { label: "Wing 4", value: "4" },
  { label: "Wing 5", value: "5" },
];

const NAV_HEIGHT = 64;

interface WingProps {
  onSelectWing: (wing: { label: string; value: string }) => void;
  bottomPadding: number;
}

const Wing: React.FC<WingProps> = ({ onSelectWing, bottomPadding }) => {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 56;

  return (
    <View style={styles.container}>
      {/* Absolute Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <ResidentsIcon
          width={26}
          height={26}
          color="#222"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.headerTitle}>Residents</Text>
      </View>
      {/* Main Content */}
      <View style={[styles.mainContent, { paddingTop: headerHeight }]}>
        <FlatList
          data={WINGS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: bottomPadding,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.wingCard}
              onPress={() => onSelectWing(item)}
            >
              <Text style={styles.wingCardText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default Wing;

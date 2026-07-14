import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import HomeIcon from "../../assets/icons/Home.svg";
import BuildingIcon from "../../assets/icons/Residents.svg";
import PlusIcon from "../../assets/icons/NewPost.svg";
import ChecklistIcon from "../../assets/icons/list.svg";
import AccountIcon from "../../assets/icons/MyProfile.svg";
import { tokens } from "../theme/colors";

interface Props extends BottomTabBarProps {}

const NAV_HEIGHT = 64;
const ICON_COLOR = tokens.ink900;

const BottomNavBar: React.FC<Props> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Tab config for easier mapping
  const tabs = [
    { name: "Feed", icon: <HomeIcon width={28} height={28} color={ICON_COLOR} /> },
    {
      name: "Residents",
      icon: <BuildingIcon width={28} height={28} color={ICON_COLOR} />,
    },
    {
      name: "NewPost",
      icon: <PlusIcon width={22} height={22} color={ICON_COLOR} />,
      isPlus: true,
    },
    {
      name: "Orders",
      icon: <ChecklistIcon width={28} height={28} color={ICON_COLOR} />,
    },
    { name: "Myprofile", icon: <AccountIcon width={28} height={28} color={ICON_COLOR} /> },
  ];

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: insets.bottom,
          height: NAV_HEIGHT + insets.bottom,
        },
      ]}
    >
      <View style={styles.inner}>
        {tabs.map((tab, idx) => {
          return (
            <TouchableOpacity
              key={tab.name}
              style={tab.isPlus ? styles.plusWrapper : styles.tab}
              onPress={() => navigation.navigate(tab.name as any)}
              activeOpacity={0.8}
            >
              {tab.isPlus ? (
                <View style={styles.plusBorder}>{tab.icon}</View>
              ) : (
                tab.icon
              )}
              {state.routeNames[state.index] === tab.name && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {/* System nav bar area */}
      {Platform.OS === "android" && insets.bottom > 0 && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: insets.bottom,
            backgroundColor: "#fff",
            zIndex: -1,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    // height and paddingBottom set dynamically
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: tokens.primary,
    height: NAV_HEIGHT,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  plusWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBorder: {
    borderWidth: 2,
    borderColor: tokens.ink900,
    borderRadius: 22,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    marginTop: 4,
    alignSelf: "center",
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
});

export default BottomNavBar;

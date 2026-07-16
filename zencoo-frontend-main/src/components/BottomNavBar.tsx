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

const NAV_HEIGHT = 60;
const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.38;

const BottomNavBar: React.FC<Props> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeName = state.routeNames[state.index];

  // Tab config for easier mapping. The plus (NewPost) icon's SVG has a
  // hardcoded dark fill, so it's drawn as a plain white glyph on a solid
  // circle instead of relying on the icon file.
  const tabs = [
    { name: "Feed", icon: HomeIcon },
    { name: "Residents", icon: BuildingIcon },
    { name: "NewPost", isPlus: true },
    { name: "Orders", icon: ChecklistIcon },
    { name: "Myprofile", icon: AccountIcon },
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
        {tabs.map((tab) => {
          const isActive = activeName === tab.name;

          if (tab.isPlus) {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.plusWrapper}
                onPress={() => navigation.navigate(tab.name as any)}
                activeOpacity={0.85}
              >
                <View style={styles.plusCircle}>
                  <View style={styles.plusGlyphH} />
                  <View style={styles.plusGlyphV} />
                </View>
              </TouchableOpacity>
            );
          }

          const Icon = tab.icon!;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.name as any)}
              activeOpacity={0.7}
            >
              <View style={{ opacity: isActive ? ACTIVE_OPACITY : INACTIVE_OPACITY }}>
                <Icon width={26} height={26} />
              </View>
              <View style={[styles.activeDot, isActive && styles.activeDotOn]} />
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
            backgroundColor: tokens.surface,
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
    backgroundColor: tokens.surface,
    height: NAV_HEIGHT,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.line,
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
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  plusGlyphH: {
    position: "absolute",
    width: 18,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: tokens.surface,
  },
  plusGlyphV: {
    position: "absolute",
    width: 2.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: tokens.surface,
  },
  activeDot: {
    marginTop: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  activeDotOn: {
    backgroundColor: tokens.primary,
  },
});

export default BottomNavBar;

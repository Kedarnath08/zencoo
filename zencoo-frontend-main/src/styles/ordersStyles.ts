import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: colors.black,
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
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    color: colors.textPrimary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 15,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 2,
  },
  noteText: {
    color: "#555",
    fontStyle: "italic",
    fontSize: 14,
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 40,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    // Shadow for iOS
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 4,
    zIndex: 10,
  },
  plusBorder: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 10,
    zIndex: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#FFB066",
  },
  tab: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: colors.white,
  },
  tabShadowWrapper: {
    backgroundColor: colors.white,
    // Shadow for iOS
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 4,
    zIndex: 9,
  },
});

export default styles;

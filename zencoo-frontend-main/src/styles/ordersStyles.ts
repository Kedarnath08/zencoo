import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
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
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#222",
  },
  linkText: {
    color: "#FF8C00",
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 15,
  },
  infoText: {
    color: "#444",
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
    color: "#fff",
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
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    // Shadow for iOS
    shadowColor: "#000",
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
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
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
    backgroundColor: "#FF8C00",
  },
  tabText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  tabShadowWrapper: {
    backgroundColor: "#fff",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 4,
    zIndex: 9,
  },
});

export default styles;

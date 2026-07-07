import { StyleSheet, Platform } from "react-native";

const CARD_RADIUS = 22;
const NAV_HEIGHT = 74;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5ECF6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: "contain",
    marginLeft: 0,
    marginRight: 0,
  },
  notificationBtn: {
    padding: 2,
    marginLeft: 10,
    marginRight: 10,
  },
  feedContainer: {
    paddingBottom: NAV_HEIGHT + 10,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginBottom: 22,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#222",
  },
  handle: {
    fontSize: 13,
    color: "#B0B0B0",
    marginTop: 2,
  },
  iconBtn: {
    marginLeft: 10,
    padding: 4,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  cardImage: {
    width: "92%",
    height: 200,
    borderRadius: 18,
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  imageOverlay: {
    position: "absolute",
    top: 18,
    right: 30,
    backgroundColor: "#FFA500",
    borderRadius: 16,
    padding: 6,
    zIndex: 2,
  },
  overlayIconBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionBarContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  actionBar: {
    flexDirection: "row",
    backgroundColor: "#FFF7E6",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignItems: "center",
    marginTop: -24,
    marginBottom: 8,
    zIndex: 2,
  },
  actionIcon: {
    marginRight: 22,
  },
  description: {
    fontSize: 14,
    color: "#222",
    paddingHorizontal: 18,
    marginBottom: 2,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: "#B0B0B0",
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    paddingVertical: 8,
  },
  commentText: {
    fontSize: 16,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
  sendIcon: {
    fontSize: 20,
  },
});

export const getFeedContainerStyle = (insetsBottom: number) => ({
  ...styles.feedContainer,
  paddingBottom: insetsBottom + 64,
});

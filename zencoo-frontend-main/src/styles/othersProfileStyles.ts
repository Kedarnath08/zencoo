import { StyleSheet, Dimensions } from "react-native";

const HEADER_HEIGHT = 200;
const PROFILE_SECTION_HEIGHT = 170;
const AVATAR_SIZE = 78;
const AVATAR_OVERLAP = 40;
const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 40) / 3;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  header: {
    backgroundColor: "#595554",
    overflow: "hidden",
    width: "100%",
  },
  headerBgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backBtn: {
    backgroundColor: "#F6F7F9",
    borderRadius: 24,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 18,
    left: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    zIndex: 20,
  },
  profileSection: {
    backgroundColor: "#E5ECF6",
    marginTop: -45,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    alignSelf: "center",
    zIndex: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: -24,
    marginBottom: 4,
    justifyContent: "flex-start",
  },
  avatarColumn: {
    alignItems: "center",
    justifyContent: "flex-start",
    // Do NOT add marginLeft or marginRight here if you want the avatar to stay as is
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 50,
    padding: 1,
    backgroundColor: "#fff",
    marginTop: -30,
    position: "relative",
    marginLeft: 0, // Adjust as needed
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 36,
    backgroundColor: "#E0E0E0",
  },
  infoStatsColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  // profileInfo: {
  //   marginBottom: 8,
  //   marginLeft: 10,
  // },
  profileInfoFixed: {
    alignItems: "flex-start",
    marginLeft: 14,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginTop: 8,
    marginLeft: 0,
  },
  username: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
    marginBottom: 4,
    marginLeft: 0,
    fontWeight: "500",
  },
  subInfo: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginLeft: 0,
  },
  statsColumnFixed: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 40,
    marginRight: 8,
  },
  statsRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statBoxFixed: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  statNumber: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
  },
  hometownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingVertical: 6,
  },
  hometownText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 6,
  },
  postsSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 10,
    paddingTop: 10,
    minHeight: 320,
  },
  postsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  postImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    margin: 4,
    backgroundColor: "#E0E0E0",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
    gap: 12, // or use marginRight on the button if gap is not supported
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 32,
    minWidth: 120, // ensures both buttons have the same minimum width
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginRight: 0, // use gap or adjust as needed
  },
  followBtn: {
    backgroundColor: "#FF8800",
  },
  messageBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  bioContainer: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 0,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  bioText: {
    fontSize: 13.5,
    color: "#526797",
    lineHeight: 21,
    fontWeight: "400",
    textAlign: "justify",
  },
});

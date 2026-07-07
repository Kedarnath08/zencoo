import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5ECF6",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 10, // space between icon and title
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  wingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ff9800",
    shadowColor: "#ff9800",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 6,
  },
  wingCardText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 0.5,
  },
});
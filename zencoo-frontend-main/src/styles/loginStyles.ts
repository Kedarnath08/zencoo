import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#222",
  },
  input: {
    height: 48,
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputFocused: {
    borderColor: "#FFA500",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: "#ff8c00",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomTextContainer: {
    alignItems: "center",
  },
  bottomText: {
    color: "#222",
    fontSize: 15,
  },
  bottomTextBold: {
    fontWeight: "bold",
    color: "#222",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: 8,
    fontSize: 13,
  },
});

export default styles;

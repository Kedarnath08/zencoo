import { StyleSheet } from "react-native";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing, elevation } from "../theme/spacing";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.canvas,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    ...elevation.floating,
    zIndex: 10,
  },
  headerTitle: {
    ...typography.title,
    color: tokens.ink900,
    marginLeft: spacing.sm,
  },
  wingCard: {
    backgroundColor: tokens.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...elevation.raised,
  },
  wingCardText: {
    ...typography.title,
    color: tokens.ink900,
  },
  backBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backBtnText: {
    color: tokens.primary,
    ...typography.body,
  },
  searchBar: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: tokens.ink900,
    borderWidth: 1.5,
    borderColor: tokens.line,
    marginBottom: spacing.lg,
  },
  searchBarFocused: {
    borderColor: tokens.primary,
  },
  residentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.raised,
  },
  avatar: {
    marginRight: spacing.lg,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    ...typography.heading,
    color: tokens.ink900,
  },
  username: {
    ...typography.caption,
    color: tokens.ink400,
    fontWeight: "500",
  },
  subInfo: {
    ...typography.caption,
    color: tokens.ink600,
    marginTop: 2,
  },
  noResults: {
    textAlign: "center",
    color: tokens.ink600,
    marginTop: 32,
    ...typography.body,
  },
  backIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
});

export default styles;

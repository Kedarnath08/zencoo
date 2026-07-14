import { StyleSheet } from "react-native";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing, elevation } from "../theme/spacing";

export const styles = StyleSheet.create({
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
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
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
});

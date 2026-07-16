import { StyleSheet } from "react-native";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    textAlign: "center",
    color: tokens.ink600,
    marginTop: 40,
    ...typography.body,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
    zIndex: 10,
  },
  plusBorder: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: tokens.surface,
  },
  headerTitle: {
    ...typography.title,
    color: tokens.ink900,
    marginLeft: spacing.sm,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: tokens.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 9,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    backgroundColor: tokens.canvas,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: tokens.primary,
  },
  tabText: {
    color: tokens.ink900,
    ...typography.label,
  },
  activeTabText: {
    color: "#fff",
  },
});

export default styles;

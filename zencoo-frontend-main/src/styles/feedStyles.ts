import { StyleSheet } from "react-native";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing, elevation } from "../theme/spacing";

const NAV_HEIGHT = 74;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.canvas,
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
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    ...elevation.floating,
    zIndex: 10,
  },
  logo: {
    width: 150,
    height: 46,
    resizeMode: "contain",
    marginLeft: 0,
    marginRight: 0,
  },
  notificationBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  feedContainer: {
    paddingBottom: NAV_HEIGHT + spacing.sm,
    paddingTop: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: tokens.surface,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
  },
  modalTitle: {
    ...typography.heading,
    color: tokens.ink900,
  },
  closeButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: tokens.ink900,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  commentItem: {
    paddingVertical: spacing.sm,
  },
  commentText: {
    ...typography.body,
    color: tokens.ink900,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.line,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: tokens.line,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: tokens.ink900,
  },
  sendButton: {
    padding: spacing.sm,
  },
  sendIcon: {
    fontSize: 20,
    color: tokens.primary,
  },
});

export const getFeedContainerStyle = (insetsBottom: number) => ({
  ...styles.feedContainer,
  paddingBottom: insetsBottom + 64,
});

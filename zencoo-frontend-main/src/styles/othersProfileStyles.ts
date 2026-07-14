import { StyleSheet, Dimensions } from "react-native";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing, elevation } from "../theme/spacing";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 40) / 3;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.canvas },
  header: {
    backgroundColor: tokens.primaryTint,
    overflow: "hidden",
    width: "100%",
  },
  headerBgImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backBtn: {
    backgroundColor: tokens.surface,
    borderRadius: radius.pill,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 18,
    left: spacing.md,
    ...elevation.raised,
    zIndex: 20,
  },
  profileSection: {
    backgroundColor: tokens.surface,
    marginTop: -45,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: "flex-start",
    ...elevation.floating,
    width: "100%",
    alignSelf: "center",
    zIndex: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: -24,
    marginBottom: spacing.xs,
    justifyContent: "flex-start",
  },
  avatarColumn: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: tokens.surface,
    borderRadius: radius.pill,
    padding: 1,
    backgroundColor: tokens.surface,
    marginTop: -30,
    position: "relative",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 36,
    backgroundColor: tokens.canvas,
  },
  infoStatsColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  profileInfoFixed: {
    alignItems: "flex-start",
    marginLeft: spacing.md,
  },
  name: {
    ...typography.heading,
    color: tokens.ink900,
    marginTop: spacing.sm,
  },
  username: {
    ...typography.label,
    color: tokens.ink600,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  subInfo: {
    ...typography.caption,
    color: tokens.ink600,
    marginTop: 2,
  },
  statsColumnFixed: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 40,
    marginRight: spacing.sm,
  },
  statsRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statBoxFixed: {
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    ...typography.heading,
    color: tokens.ink900,
  },
  statLabel: {
    ...typography.caption,
    color: tokens.ink600,
  },
  hometownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignSelf: "flex-start",
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  hometownText: {
    ...typography.body,
    color: tokens.ink600,
    marginLeft: spacing.xs,
  },
  postsSection: {
    backgroundColor: tokens.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    minHeight: 320,
  },
  postsGrid: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
  postImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.md,
    margin: spacing.xs,
    backgroundColor: tokens.canvas,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxl,
    minWidth: 120,
  },
  followBtn: {
    backgroundColor: tokens.primary,
  },
  messageBtn: {
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.line,
  },
  actionBtnText: {
    ...typography.heading,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  bioContainer: {
    width: "100%",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignSelf: "flex-start",
  },
  bioText: {
    ...typography.body,
    color: tokens.ink600,
    lineHeight: 21,
  },
});

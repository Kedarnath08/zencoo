import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { styles } from "../../styles/myProfileStyles";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../navigation/ProfileStack";
import { useProfileImageUpload } from "../../hooks/useProfileImageUpload";
import {
  fetchMyProfile,
  updateBio,
  updateHometown,
  updateProfilePic,
} from "../../api/user";
import { fetchUserPosts, deletePost } from "../../api/posts";
import { removePostFromCache } from "../../api/postsCache";
import { queryKeys } from "../../api/queryKeys";
import { useAuth } from "../../context/AuthContext";
import ProfileStatsRow from "../../components/ProfileStatsRow";
import PostsGrid from "../../components/PostsGrid";
import { tokens } from "../../theme/colors";

const profilePic = require("../../../assets/images/profile-placeholder.jpg");
const imageMap: { [key: string]: any } = {
  "../../../assets/images/pulses.jpg": require("../../../assets/images/pulses.jpg"),
  "../../../assets/images/veggies (2).jpg": require("../../../assets/images/veggies (2).jpg"),
  "../../../assets/images/dates.jpg": require("../../../assets/images/dates.jpg"),
  "../../../assets/images/profile-placeholder.jpg": profilePic,
};

// 1. Define a Profile type
type Profile = {
  id: string;
  username: string; // unique handle, e.g. "janhvi_kapoor"
  displayName: string; // normal name, e.g. "Janhvi Kapoor"
  wing: string;
  door: string;
  bio: string;
  hometown: string;
  profilePic: string;
  headerBg: string | null;
  followersCount: number;
  posts: string[];
};

/**
 * Wraps the raw `GET /api/profile` query and merges it into the UI's
 * `Profile` shape, falling back to local defaults (`myProfile.json`) for
 * fields the backend doesn't have (`headerBg`) or on fetch failure — same
 * merge behavior as before the TanStack Query migration, just recomputed
 * from cached query data instead of held in its own `useState`.
 */
const useProfile = () => {
  const profileQuery = useQuery({
    queryKey: queryKeys.myProfile(),
    queryFn: fetchMyProfile,
  });

  const profile = useMemo<Profile | null>(() => {
    const localData = require("../../data/myProfile.json");
    if (profileQuery.isPending) return null;
    const data = profileQuery.data;
    if (!data) return localData;
    return {
      ...localData,
      id: String(data.id),
      username: data.username,
      displayName: data.fullName,
      wing: data.doorNumber ? String(data.doorNumber)[0] : "",
      door: data.doorNumber,
      bio: data.bio ?? localData.bio,
      hometown: data.hometown ?? localData.hometown,
      profilePic: data.profilePic ?? localData.profilePic,
      followersCount: data.followersCount ?? 0,
    };
  }, [profileQuery.data, profileQuery.isPending]);

  return { profile, userId: profileQuery.data?.id };
};

const EditableField = ({
  value,
  editing,
  inputValue,
  setInputValue,
  onSave,
  onCancel,
  saving,
  placeholder,
  icon,
  multiline,
  maxLength,
}: any) =>
  editing ? (
    <View style={{ width: "100%" }}>
      <TextInput
        style={[
          styles.editableFieldInput,
          multiline
            ? styles.editableFieldInputMultiline
            : styles.editableFieldInputSingle,
        ]}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxLength}
        editable={!saving}
      />
      {maxLength && (
        <Text style={styles.editableFieldCounter}>
          {inputValue.length}/{maxLength}
        </Text>
      )}
      <View style={styles.editableFieldBtnRow}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.editableFieldCancelBtn}
          disabled={saving}
        >
          <Text style={styles.editableFieldCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          style={[
            styles.editableFieldSaveBtn,
            saving && styles.editableFieldSaveBtnDisabled,
          ]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.editableFieldSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <TouchableOpacity
      style={styles.editableFieldRow}
      onPress={() => setInputValue(value)}
      activeOpacity={0.7}
    >
      {icon}
      <View>
        {value ? (
          <Text style={styles.bioText}>{value}</Text>
        ) : (
          <>
            <Text style={styles.bioTitle}>Add {placeholder}</Text>
            <Text style={styles.bioSubtitle}>Tell others about yourself</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

const MyProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { signOut } = useAuth();
  const { profile, userId } = useProfile();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => void signOut() },
    ]);
  };
  const [editMode, setEditMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [pickedHeaderBg, setPickedHeaderBg] = useState<string | null>(null);
  const [bioState, setBioState] = useState({
    editing: false,
    input: "",
    saving: false,
  });
  const [hometownState, setHometownState] = useState({
    editing: false,
    input: "",
    saving: false,
  });

  // When profile changes, update bioInput if not editing
  useEffect(() => {
    if (profile && !bioState.editing)
      setBioState((s) => ({ ...s, input: profile.bio || "" }));
  }, [profile, bioState.editing]);

  // When profile changes, update hometownInput if not editing
  useEffect(() => {
    if (profile && !hometownState.editing)
      setHometownState((s) => ({ ...s, input: profile.hometown || "" }));
  }, [profile, hometownState.editing]);

  // Load the current user's real posts once we know their id.
  const myPostsQuery = useQuery({
    queryKey: queryKeys.myPosts(userId ?? -1),
    queryFn: () => fetchUserPosts(userId as number),
    enabled: userId != null,
  });
  const posts = myPostsQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: ({ field, value }: { field: "bio" | "hometown"; value: string }) =>
      field === "bio" ? updateBio(value) : updateHometown(value),
    onSuccess: (data, { field }) => {
      qc.setQueryData(queryKeys.myProfile(), (old) =>
        old ? { ...old, [field]: (data as any)[field] } : old
      );
    },
  });

  const saveField = useCallback(
    (field: "bio" | "hometown", value: string, setState: any) => {
      setState((s: any) => ({ ...s, saving: true }));
      saveMutation.mutate(
        { field, value },
        {
          onSuccess: () =>
            setState((s: any) => ({ ...s, editing: false, saving: false })),
          onError: () => {
            Alert.alert(`Failed to save ${field}. Please try again.`);
            setState((s: any) => ({ ...s, saving: false }));
          },
        }
      );
    },
    [saveMutation]
  );

  // Pick image from gallery — headerBg has no backend representation yet
  // (see PROJECT.md), so this stays purely local/session-only, same as before.
  const pickHeaderImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // fixed here
      allowsEditing: true,
      aspect: [3, 2],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length)
      setPickedHeaderBg(result.assets[0].uri);
  };

  // Pick profile image from gallery
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // updated here
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    // setProfilePic(result.assets[0].uri); // implement as needed
  };

  // Toggle post selection (by post id)
  const toggleSelectPost = (postId: number) =>
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((i) => i !== postId)
        : [...prev, postId]
    );

  // Delete selected posts via the backend, then update the grid.
  const handleDeletePosts = () => {
    if (!selectedPosts.length) return;
    Alert.alert(
      "Delete posts",
      `Delete ${selectedPosts.length} selected post${
        selectedPosts.length === 1 ? "" : "s"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ids = [...selectedPosts];
            setDeleting(true);
            try {
              await Promise.all(ids.map((id) => deletePost(id)));
              ids.forEach((id) => removePostFromCache(qc, id));
              setSelectedPosts([]);
              setEditMode(false);
            } catch {
              Alert.alert("Failed to delete some posts. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // 👇 Always call hooks before any early return!
  const { uploading, pickAndUpload } = useProfileImageUpload(async (url) => {
    qc.setQueryData(queryKeys.myProfile(), (old) =>
      old ? { ...old, profilePic: url } : old
    );
    try {
      await updateProfilePic(url);
    } catch {
      Alert.alert("Failed to save profile picture to backend.");
    }
  });

  if (!profile) return null; // or a loading spinner

  const headerBg = pickedHeaderBg ?? profile.headerBg;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image, back button, and camera icon */}
        <ImageBackground
          source={headerBg ? { uri: headerBg } : undefined}
          style={[styles.header, { paddingTop: insets.top }]}
          imageStyle={styles.headerBgImage}
        >
          <View style={styles.overlay} />
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.backBtn}
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={28} color={tokens.ink600} />
          </TouchableOpacity>
          {/* Centered camera icon as per your image, with pickHeaderImage functionality */}
          <TouchableOpacity
            onPress={pickHeaderImage}
            style={styles.centerCameraBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="add-a-photo"
              size={96}
              color={tokens.ink400}
              style={{ opacity: 0.28 }}
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarColumn}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    profile.profilePic && profile.profilePic.startsWith("http")
                      ? { uri: profile.profilePic }
                      : imageMap[profile.profilePic] || profilePic
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={pickAndUpload}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => alert("Edit profile details")}
                    style={{ flexDirection: "row", alignItems: "center" }}
                    accessibilityLabel="Edit profile details"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.name}>{profile.displayName}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={tokens.ink900}
                      style={{ marginLeft: 2, marginTop: 6 }}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.subInfo}>
                  <Ionicons name="business" size={14} color={tokens.ink600} /> Wing{" "}
                  {profile.wing} - {profile.door}
                </Text>
              </View>
            </View>
            <ProfileStatsRow
              followersCount={profile.followersCount}
              postsCount={posts.length}
              onFollowersPress={() =>
                navigation.navigate("FollowList", {
                  userId: Number(profile.id),
                  initialTab: "followers",
                })
              }
              styles={styles}
            />
          </View>

          {/* Bio Card - MOBILE FRIENDLY VERSION */}
          <View style={[styles.bioCard, { paddingBottom: 20 }]}>
            <EditableField
              value={profile.bio}
              editing={bioState.editing}
              inputValue={bioState.input}
              setInputValue={(v: string) =>
                setBioState((s) => ({ ...s, input: v }))
              }
              onSave={() => saveField("bio", bioState.input, setBioState)}
              onCancel={() =>
                setBioState((s) => ({
                  ...s,
                  editing: false,
                  input: profile.bio || "",
                }))
              }
              saving={bioState.saving}
              placeholder="Bio"
              icon={
                !profile.bio && (
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color={tokens.ink600}
                    style={{ marginRight: 10 }}
                  />
                )
              }
              multiline
              maxLength={500}
            />
          </View>

          {/* Add Hometown */}
          <View style={styles.hometownRow}>
            {hometownState.editing ? (
              <View style={styles.hometownInputRow}>
                <TextInput
                  style={styles.hometownInput}
                  value={hometownState.input}
                  onChangeText={(v: string) =>
                    setHometownState((s) => ({ ...s, input: v }))
                  }
                  placeholder="Enter hometown"
                  editable={!hometownState.saving}
                />
                <TouchableOpacity
                  onPress={() =>
                    saveField("hometown", hometownState.input, setHometownState)
                  }
                  disabled={hometownState.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="checkmark" size={24} color={tokens.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setHometownState((s) => ({
                      ...s,
                      editing: false,
                      input: profile.hometown || "",
                    }))
                  }
                  disabled={hometownState.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="close" size={24} color={tokens.ink600} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() =>
                  setHometownState((s) => ({ ...s, editing: true }))
                }
              >
                <Ionicons name="location-outline" size={18} color={tokens.ink600} />
                <Text style={styles.hometownText}>
                  {profile.hometown ? profile.hometown : "Add hometown"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Posts Grid */}
        <View
          style={[styles.postsSection, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.postsHeader}>
            <Text style={styles.postsTitle}>POSTS</Text>
            <TouchableOpacity
              onPress={() => setEditMode((e) => !e)}
              style={styles.editPostsBtn}
              accessibilityLabel="Edit posts"
            >
              <View style={styles.editIconWrapper}>
                <MaterialIcons
                  name="edit"
                  size={16}
                  color={tokens.ink600}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
            {editMode && (
              <TouchableOpacity
                onPress={handleDeletePosts}
                style={styles.deletePostsBtn}
                accessibilityLabel="Delete selected posts"
              >
                <View style={styles.deleteIconWrapper}>
                  <MaterialIcons
                    name="delete"
                    size={16}
                    color="#fff"
                    style={styles.deleteIcon}
                  />
                </View>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          <PostsGrid
            posts={posts}
            onPressPost={(item) =>
              navigation.navigate("PostDetail", { postId: item.id, isOwn: true })
            }
            emptyMessage="You haven't posted yet."
            emptyTextStyle={{ color: tokens.ink600, padding: 16 }}
            contentContainerStyle={[styles.postsGrid, { paddingBottom: 80 }]}
            activeOpacity={0.7}
            editMode={editMode}
            selectedIds={selectedPosts}
            onToggleSelect={toggleSelectPost}
            styles={{
              postImage: styles.postImage,
              postWrapper: styles.postWrapper,
              postContainer: styles.postContainer,
              checkboxContainer: styles.checkboxContainer,
              checkbox: styles.checkbox,
              checkboxSelected: styles.checkboxSelected,
            }}
          />
        </View>
        {(uploading || deleting) && (
          <ActivityIndicator size="large" style={{ margin: 20 }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MyProfileScreen;

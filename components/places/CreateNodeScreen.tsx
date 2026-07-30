import HeaderTextButton from "@/components/HeaderTextButton";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import useItemPhotoUpload from "@/domain/photos/useItemPhotoUpload";
import api from "@/interceptors/axios";
import { setPendingDateCallback } from "@/utils/dateSelectionBridge";
import { backModal, pushModal } from "@/utils/modalNav";
import { CATEGORY_OPTIONS, CreateNodeKind, EMPTY_NODE_FIELDS, NodeFormFields } from "@/utils/nodeFields";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { setPendingPhotoCallback } from "@/utils/photoSelectionBridge";
import { parseTags } from "@/utils/tags";
import { setPendingTagsCallback } from "@/utils/tagsSelectionBridge";
import { useHeaderHeight } from "@react-navigation/elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TITLES: Record<CreateNodeKind, string> = {
  room: "Add Room",
  container: "Add Container",
  item: "Add Item",
};

type CreateNodeScreenProps = {
  /** The current tab's own route prefix, e.g. "/(tabs)/places" - see
   * NodeDetailScreen's basePath doc for why this exists. */
  basePath: string;
};

export default function CreateNodeScreen({ basePath }: CreateNodeScreenProps) {
  const { kind, parentKey, parentId } = useLocalSearchParams<{
    kind: CreateNodeKind;
    parentKey: string;
    parentId: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [fields, setFields] = useState<NodeFormFields>(EMPTY_NODE_FIELDS);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const photoUpload = useItemPhotoUpload();
  const headerHeight = useHeaderHeight();
  const colors = useThemeColors();

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const set = (key: keyof NodeFormFields) => (value: string) => setFields((prev) => ({ ...prev, [key]: value }));

  const openPhotoViewer = () => {
    setPendingPhotoCallback(setPendingPhotoUri);
    pushModal({ pathname: `${basePath}/photo` as any, params: { pictureUrl: pendingPhotoUri ?? "" } });
  };

  const handlePickCategory = () => {
    setPendingOptionCallback(set("category"));
    pushModal({
      pathname: `${basePath}/pick-option` as any,
      params: { title: "Category", value: fields.category, options: JSON.stringify(CATEGORY_OPTIONS) },
    });
  };

  const handlePickDate = () => {
    setPendingDateCallback(set("expiration_date"));
    pushModal({
      pathname: `${basePath}/pick-date` as any,
      params: { value: fields.expiration_date, title: "Expiration Date" },
    });
  };

  const handlePickTags = () => {
    setPendingTagsCallback(set("tags"));
    pushModal({ pathname: `${basePath}/pick-tags` as any, params: { tags: fields.tags, title: "Tags" } });
  };

  const handleSubmit = async () => {
    if (!fields.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const parentField = { [parentKey]: parentId };

    try {
      if (kind === "room") {
        await api.post(
          "/app/room",
          { ...parentField, name: fields.name.trim(), description: fields.description.trim() || null },
          authHeaders,
        );
      } else if (kind === "container") {
        await api.post(
          "/app/container",
          { ...parentField, name: fields.name.trim(), description: fields.description.trim() || null },
          authHeaders,
        );
      } else {
        const res = await api.post(
          "/app/item",
          {
            ...parentField,
            name: fields.name.trim(),
            description: fields.description.trim() || null,
            quantity: Number(fields.quantity) || 1,
            category: fields.category || null,
            expiration_date: fields.expiration_date.trim() || null,
            comment: fields.comment.trim() || null,
            tags: parseTags(fields.tags),
          },
          authHeaders,
        );

        const newItemId = res.data?.id;
        if (pendingPhotoUri && newItemId) {
          const photoUrl = await photoUpload.uploadToItem(newItemId, pendingPhotoUri);
          if (!photoUrl) {
            backModal();
            Alert.alert("Item created", "Photo upload failed — you can add it later from the item's page.");
            return;
          }
        }
      }

      backModal();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Something went wrong.");
      } else {
        setErrorMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === fields.category)?.label;

  return (
    <>
      <Stack.Screen
        options={{
          title: TITLES[kind],
          headerLeft: () => <HeaderTextButton title="Cancel" color={colors.textSecondary} onPress={backModal} />,
          headerRight: () => (loading ? undefined : <HeaderTextButton title="Add" bold onPress={handleSubmit} />),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight + 50}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
          {errorMessage && <Text style={{ color: colors.destructive }}>{errorMessage}</Text>}

          <TextInput
            value={fields.name}
            onChangeText={set("name")}
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="done"
            style={[inputStyle, { borderColor: colors.border, color: colors.text }]}
          />

          <TextInput
            value={fields.description}
            onChangeText={set("description")}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="done"
            style={[inputStyle, { borderColor: colors.border, color: colors.text }]}
          />

          {kind === "item" && (
            <>
              <TextInput
                value={fields.quantity}
                onChangeText={set("quantity")}
                placeholder="Quantity"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                returnKeyType="done"
                style={[inputStyle, { borderColor: colors.border, color: colors.text }]}
              />

              <TouchableOpacity onPress={handlePickCategory} style={[inputStyle, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 16, color: categoryLabel ? colors.text : colors.textSecondary }}>
                  {categoryLabel || "Category (optional)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePickDate} style={[inputStyle, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 16, color: fields.expiration_date ? colors.text : colors.textSecondary }}>
                  {fields.expiration_date || "Expiration date (optional)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePickTags} style={[inputStyle, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 16, color: fields.tags ? colors.text : colors.textSecondary }}>
                  {fields.tags || "Tags (optional)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openPhotoViewer}>
                {pendingPhotoUri ? (
                  <Image
                    source={{ uri: pendingPhotoUri }}
                    style={{ width: "100%", height: 200, borderRadius: 8, backgroundColor: colors.surfaceAlt }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: colors.surfaceAlt,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                    }}
                  >
                    <MaterialCommunityIcons name="image-plus-outline" size={22} color={colors.textMuted} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Add Photo (optional)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                value={fields.comment}
                onChangeText={set("comment")}
                placeholder="Comment (optional)"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                style={[inputStyle, { borderColor: colors.border, color: colors.text }]}
              />
            </>
          )}

          {loading && <ActivityIndicator />}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
};

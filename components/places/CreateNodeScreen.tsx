import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { setPendingDateCallback } from "@/utils/dateSelectionBridge";
import { backModal, pushModal } from "@/utils/modalNav";
import { CATEGORY_OPTIONS, CreateNodeKind, EMPTY_NODE_FIELDS, NodeFormFields } from "@/utils/nodeFields";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { parseTags } from "@/utils/tags";
import { setPendingTagsCallback } from "@/utils/tagsSelectionBridge";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";

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

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const set = (key: keyof NodeFormFields) => (value: string) => setFields((prev) => ({ ...prev, [key]: value }));

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
        await api.post(
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
            picture: fields.picture.trim() || null,
          },
          authHeaders,
        );
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
          headerLeft: () => <HeaderTextButton title="Cancel" color="#808080" onPress={backModal} />,
          headerRight: () => (loading ? undefined : <HeaderTextButton title="Add" bold onPress={handleSubmit} />),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}

        <TextInput
          value={fields.name}
          onChangeText={set("name")}
          placeholder="Name"
          placeholderTextColor="grey"
          autoFocus
          returnKeyType="done"
          style={inputStyle}
        />

        <TextInput
          value={fields.description}
          onChangeText={set("description")}
          placeholder="Description (optional)"
          placeholderTextColor="grey"
          returnKeyType="done"
          style={inputStyle}
        />

        {kind === "item" && (
          <>
            <TextInput
              value={fields.quantity}
              onChangeText={set("quantity")}
              placeholder="Quantity"
              placeholderTextColor="grey"
              keyboardType="number-pad"
              returnKeyType="done"
              style={inputStyle}
            />

            <TouchableOpacity onPress={handlePickCategory} style={inputStyle}>
              <Text style={{ fontSize: 16, color: categoryLabel ? "black" : "grey" }}>
                {categoryLabel || "Category (optional)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickDate} style={inputStyle}>
              <Text style={{ fontSize: 16, color: fields.expiration_date ? "black" : "grey" }}>
                {fields.expiration_date || "Expiration date (optional)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickTags} style={inputStyle}>
              <Text style={{ fontSize: 16, color: fields.tags ? "black" : "grey" }}>
                {fields.tags || "Tags (optional)"}
              </Text>
            </TouchableOpacity>

            <TextInput
              value={fields.picture}
              onChangeText={set("picture")}
              placeholder="Picture URL (optional)"
              placeholderTextColor="grey"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
              style={inputStyle}
            />

            <TextInput
              value={fields.comment}
              onChangeText={set("comment")}
              placeholder="Comment (optional)"
              placeholderTextColor="grey"
              returnKeyType="done"
              style={inputStyle}
            />
          </>
        )}

        {loading && <ActivityIndicator />}
      </ScrollView>
    </>
  );
}

const inputStyle = {
  borderColor: "#ccc",
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
};

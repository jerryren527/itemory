import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { backModal, pushModal } from "@/utils/modalNav";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

const QUANTITY_OPTIONS = Array.from({ length: 100 }, (_, n) => ({ label: String(n), value: String(n) }));

type Checkout = { user_id: number; username: string; quantity: number };

type ServerItemState = { quantity: number; available_quantity: number; checkouts: Checkout[]; updated_at: string };

function parseCheckouts(raw?: string): Checkout[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

type EditQuantityScreenProps = {
  /** The current tab's own route prefix, e.g. "/(tabs)/places" - see
   * NodeDetailScreen's basePath doc for why this exists. */
  basePath: string;
};

export default function EditQuantityScreen({ basePath }: EditQuantityScreenProps) {
  const { itemId, quantity, availableQuantity, checkouts, canManageCheckouts, updatedAt } = useLocalSearchParams<{
    itemId: string;
    quantity: string;
    availableQuantity: string;
    checkouts: string;
    canManageCheckouts: string;
    updatedAt?: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [total, setTotal] = useState(quantity ?? "1");
  const [available, setAvailable] = useState(Number(availableQuantity ?? quantity ?? 0));
  const [checkoutList, setCheckoutList] = useState<Checkout[]>(() => parseCheckouts(checkouts));
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(updatedAt);
  const [saving, setSaving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };
  const canManage = canManageCheckouts === "true";

  const applyServerState = (data: ServerItemState) => {
    setTotal(String(data.quantity));
    setAvailable(data.available_quantity);
    setCheckoutList(data.checkouts);
    setExpectedUpdatedAt(data.updated_at);
  };

  const errorMessageFrom = (err: unknown) =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? "Something went wrong.") : "Something went wrong.";

  const openTotalPicker = () => {
    setPendingOptionCallback(async (value) => {
      const newTotal = Number(value);
      setSaving(true);
      try {
        const res = await api.post(
          `/app/item/${itemId}/update`,
          { quantity: newTotal, expected_updated_at: expectedUpdatedAt },
          authHeaders,
        );
        applyServerState(res.data);
      } catch (err) {
        Alert.alert("Error", errorMessageFrom(err));
      } finally {
        setSaving(false);
      }
    });
    pushModal({
      pathname: `${basePath}/pick-option` as any,
      params: { title: "Total Quantity", value: total, options: JSON.stringify(QUANTITY_OPTIONS), layout: "centered" },
    });
  };

  const openCheckoutPicker = () => {
    if (available <= 0) return;
    setPendingOptionCallback(async (value) => {
      const qty = Number(value);
      setSaving(true);
      try {
        const res = await api.post(`/app/item/${itemId}/checkout`, { quantity: qty }, authHeaders);
        applyServerState(res.data);
      } catch (err) {
        Alert.alert("Error", errorMessageFrom(err));
      } finally {
        setSaving(false);
      }
    });
    pushModal({
      pathname: `${basePath}/pick-option` as any,
      params: {
        title: "Check Out",
        options: JSON.stringify(
          Array.from({ length: available }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })),
        ),
        layout: "centered",
      },
    });
  };

  const handleReturn = (entry: Checkout) => {
    setPendingOptionCallback(async (value) => {
      const qty = Number(value);
      try {
        const res = await api.post(
          `/app/item/${itemId}/return`,
          { user_id: entry.user_id, quantity: qty },
          authHeaders,
        );
        applyServerState(res.data);
      } catch (err) {
        Alert.alert("Error", errorMessageFrom(err));
      }
    });
    pushModal({
      pathname: `${basePath}/pick-option` as any,
      params: {
        title: entry.user_id === state.userId ? "Return Quantity" : `Return from @${entry.username}`,
        value: String(entry.quantity),
        options: JSON.stringify(
          Array.from({ length: entry.quantity }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })),
        ),
        layout: "centered",
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Quantity",
          headerRight: () => <HeaderTextButton title="Done" bold onPress={backModal} />,
        }}
      />
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "grey", fontSize: 13, marginBottom: 4 }}>Total Quantity</Text>
        <TouchableOpacity
          onPress={openTotalPicker}
          disabled={saving}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16 }}>{total}</Text>
          {saving ? <ActivityIndicator /> : <MaterialCommunityIcons name="chevron-down" size={18} color="#555" />}
        </TouchableOpacity>

        <Text style={{ fontSize: 14, marginBottom: 16 }}>
          Available: <Text style={{ fontWeight: "600" }}>{available}</Text>
        </Text>

        <Text style={{ color: "grey", fontSize: 13, marginBottom: 4 }}>Check Out</Text>
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={openCheckoutPicker}
            disabled={saving || available <= 0}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              opacity: available <= 0 ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 16, color: available <= 0 ? "grey" : "#000" }}>
              {available <= 0 ? "None available" : "Select quantity"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: "grey", fontSize: 13, marginBottom: 4 }}>Checked Out</Text>
        {checkoutList.length === 0 ? (
          <Text style={{ color: "grey", fontSize: 14 }}>Nothing checked out.</Text>
        ) : (
          <FlatList
            data={checkoutList}
            keyExtractor={(entry) => String(entry.user_id)}
            renderItem={({ item: entry }) => {
              const canReturn = canManage || entry.user_id === state.userId;
              return (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    @{entry.username} <Text style={{ color: "grey" }}>x{entry.quantity}</Text>
                  </Text>
                  {canReturn && (
                    <TouchableOpacity onPress={() => handleReturn(entry)} hitSlop={8}>
                      <Text style={{ color: "#2563EB", fontWeight: "600" }}>Return</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </>
  );
}

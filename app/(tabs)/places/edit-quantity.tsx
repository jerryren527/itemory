import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { backModal, pushModal } from "@/utils/modalNav";
import { setPendingTextCallback } from "@/utils/textSelectionBridge";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

type Checkout = { user_id: number; username: string; quantity: number };

type ServerItemState = { quantity: number; available_quantity: number; checkouts: Checkout[] };

function parseCheckouts(raw?: string): Checkout[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function EditQuantityScreen() {
  const { itemId, quantity, availableQuantity, checkouts, canManageCheckouts } = useLocalSearchParams<{
    itemId: string;
    quantity: string;
    availableQuantity: string;
    checkouts: string;
    canManageCheckouts: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [total, setTotal] = useState(quantity ?? "1");
  const [available, setAvailable] = useState(Number(availableQuantity ?? quantity ?? 0));
  const [checkoutList, setCheckoutList] = useState<Checkout[]>(() => parseCheckouts(checkouts));
  const [checkoutInput, setCheckoutInput] = useState("");
  const [saving, setSaving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };
  const canManage = canManageCheckouts === "true";

  const applyServerState = (data: ServerItemState) => {
    setTotal(String(data.quantity));
    setAvailable(data.available_quantity);
    setCheckoutList(data.checkouts);
  };

  const errorMessageFrom = (err: unknown) =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? "Something went wrong.") : "Something went wrong.";

  const handleSaveTotal = async () => {
    const newTotal = Number(total);
    if (!Number.isFinite(newTotal) || newTotal < 0) {
      Alert.alert("Error", "Enter a valid quantity.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/app/item/${itemId}/update`, { quantity: newTotal }, authHeaders);
      applyServerState(res.data);
    } catch (err) {
      Alert.alert("Error", errorMessageFrom(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    const qty = Number(checkoutInput);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert("Error", "Enter a quantity to check out.");
      return;
    }
    if (qty > available) {
      Alert.alert("Error", `Only ${available} available.`);
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/app/item/${itemId}/checkout`, { quantity: qty }, authHeaders);
      applyServerState(res.data);
      setCheckoutInput("");
    } catch (err) {
      Alert.alert("Error", errorMessageFrom(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = (entry: Checkout) => {
    setPendingTextCallback(async (value) => {
      const qty = Number(value);
      if (!Number.isFinite(qty) || qty <= 0 || qty > entry.quantity) {
        Alert.alert("Error", `Enter a quantity between 1 and ${entry.quantity}.`);
        return;
      }
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
      pathname: "/(tabs)/places/edit-text",
      params: {
        title: entry.user_id === state.userId ? "Return Quantity" : `Return from @${entry.username}`,
        placeholder: "Quantity",
        initialValue: String(entry.quantity),
        submitLabel: "Return",
        keyboardType: "number-pad",
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <TextInput
            value={total}
            onChangeText={setTotal}
            keyboardType="number-pad"
            style={{
              flex: 1,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleSaveTotal}
            disabled={saving}
            style={{ paddingHorizontal: 12, paddingVertical: 10 }}
          >
            {saving ? <ActivityIndicator /> : <Text style={{ color: "#2563EB", fontWeight: "600" }}>Save</Text>}
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, marginBottom: 16 }}>
          Available: <Text style={{ fontWeight: "600" }}>{available}</Text>
        </Text>

        <Text style={{ color: "grey", fontSize: 13, marginBottom: 4 }}>Check Out</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <TextInput
            value={checkoutInput}
            onChangeText={setCheckoutInput}
            keyboardType="number-pad"
            placeholder="Quantity"
            placeholderTextColor="grey"
            style={{
              flex: 1,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={saving}
            style={{ paddingHorizontal: 12, paddingVertical: 10 }}
          >
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>Check Out</Text>
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

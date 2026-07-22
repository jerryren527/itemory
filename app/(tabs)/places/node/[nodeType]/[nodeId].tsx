import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import SearchBar from "@/components/places/SearchBar";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type NodeDetails = {
  name: string;
  description: string | null;
  picture: string | null;
  quantity?: number;
  expiration_date?: string | null;
  category?: string | null;
  status?: string;
  tags?: string[] | null;
  comment?: string | null;
};

type NodeResponse = {
  node_details: NodeDetails;
  children: PlaceRowItem[];
};

export default function NodeScreen() {
  const { nodeType, nodeId, name } = useLocalSearchParams<{ nodeType: string; nodeId: string; name?: string }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [data, setData] = useState<NodeResponse | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const loadNode = async () => {
      setLoadStatus("loading");

      try {
        const res = await api.get(`/app/place-node/${nodeType}/${nodeId}`, {
          headers: { Authorization: `Bearer ${state.tokens.accessToken}` },
        });
        if (cancelled) return;
        setData(res.data);
        setLoadStatus("ready");
      } catch (err) {
        console.log("err", err);
        if (!cancelled) setLoadStatus("error");
      }
    };

    loadNode();

    return () => {
      cancelled = true;
    };
  }, [nodeType, nodeId]);

  const title = data?.node_details?.name ?? name ?? "";

  if (loadStatus === "loading") {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (loadStatus === "error" || !data) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Something went wrong.</Text>
        </View>
      </>
    );
  }

  if (nodeType === "item") {
    const item = data.node_details;
    return (
      <>
        <Stack.Screen options={{ title }} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 22, marginBottom: 8 }}>{item.name}</Text>
          {item.description ? <Text style={{ marginBottom: 8 }}>{item.description}</Text> : null}
          <Text>Quantity: {item.quantity}</Text>
          {item.status ? <Text>Status: {item.status}</Text> : null}
          {item.category ? <Text>Category: {item.category}</Text> : null}
          {item.expiration_date ? <Text>Expires: {item.expiration_date}</Text> : null}
          {item.tags && item.tags.length > 0 ? <Text>Tags: {item.tags.join(", ")}</Text> : null}
          {item.comment ? <Text>Comment: {item.comment}</Text> : null}
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <SearchBar
        mode="link"
        placeholder={`Search in ${data.node_details.name}`}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/places/search",
            params: { originType: nodeType, originId: nodeId, originName: data.node_details.name },
          })
        }
      />
      <ScrollView>
        {data.children.map((child) => (
          <PlaceRow
            key={`${child.type}-${child.id}`}
            item={child}
            onPress={(rowItem) =>
              router.push({
                pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
                params: { nodeType: rowItem.type, nodeId: String(rowItem.id), name: rowItem.name },
              })
            }
          />
        ))}
      </ScrollView>
    </>
  );
}

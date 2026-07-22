import PlaceRow from "@/components/places/PlaceRow";
import SearchBar from "@/components/places/SearchBar";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import axios from "axios";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import api from "../../../interceptors/axios";

import { Dropdown } from "react-native-element-dropdown";

type HomeDetails = {
  id: number;
  name: string;
  address: string | null;
  is_primary: boolean;
};

type Room = {
  id: number;
  name: string;
};

type PlacesTabResponse = {
  home_details: HomeDetails | null;
  rooms: Room[] | null;
  homes: HomeDetails[] | null;
};

export default function Index() {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext); // keep here for testing purposes.
  const primaryHome = state.primaryHome;
  console.log("🚀 ~ index.tsx:29 ~ Index ~ primaryHome:", primaryHome);
  const [currentHomeDetails, setCurrentHomeDetails] = useState<PlacesTabResponse>({
    home_details: null,
    rooms: null,
    homes: null,
  });
  const [selectedHome, setSelectedHome] = useState<number | null>(primaryHome);
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [creatingHome, setCreatingHome] = useState(false);
  const [createHomeError, setCreateHomeError] = useState("");

  console.log("🚀 ~ index.tsx:39 ~ Index ~ currentHomeDetails:", JSON.stringify(currentHomeDetails, null, 2));

  const handlePress = async () => {
    console.log("Pressed!");
    const res = await axios.get(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/place-node/1/1/`);
    // console.log("🚀 ~ index.tsx:8 ~ handlePress ~ res.data:", res.data);
  };

  const handleCreateHome = async () => {
    if (!homeName.trim()) {
      setCreateHomeError("Home name is required.");
      return;
    }

    setCreatingHome(true);
    setCreateHomeError("");

    try {
      const res = await api.post(
        "/app/create-home",
        { name: homeName.trim(), address: homeAddress.trim() || null },
        {
          headers: {
            Authorization: `Bearer ${state.tokens.accessToken}`,
          },
        },
      );

      dispatch({ type: "PRIMARY_HOME_SET", payload: { primaryHome: res.data.id } });
      setSelectedHome(res.data.id);
      setHomeName("");
      setHomeAddress("");
    } catch (err) {
      console.log("err", err);
      if (axios.isAxiosError(err) && err.response) {
        setCreateHomeError(err.response.data?.message ?? "An unexpected error occurred.");
      } else {
        setCreateHomeError("An unexpected error occurred.");
      }
    } finally {
      setCreatingHome(false);
    }
  };

  useEffect(() => {
    const getSelectHomeDetails = async () => {
      try {
        const res = await api.get(`/app/places-tab/${selectedHome}`, {
          headers: {
            Authorization: `Bearer ${state.tokens.accessToken}`,
          },
        });
        setCurrentHomeDetails(res.data);
      } catch (err) {
        console.log("err", err);
      }
    };

    if (!selectedHome) {
      return;
    } else {
      getSelectHomeDetails();
    }
  }, [selectedHome]);

  // A value computed by useMemo. Only recalculates when a value in the dependency array is updated.
  const dropdownData = useMemo(() => {
    if (!currentHomeDetails.homes) return [];
    return currentHomeDetails.homes.map((home) => ({
      label: home.name,
      value: home.id,
    }));
  }, [currentHomeDetails.homes]);

  return (
    <>
      {primaryHome === null && (
        <View>
          <Text style={{ fontSize: 20 }}>Add a Place</Text>
          <TextInput
            placeholder="Home name"
            value={homeName}
            onChangeText={setHomeName}
            style={{
              borderColor: "black",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 250,
              marginTop: 10,
            }}
          />
          <TextInput
            placeholder="Address (optional)"
            value={homeAddress}
            onChangeText={setHomeAddress}
            style={{
              borderColor: "black",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 250,
              marginTop: 10,
            }}
          />
          {createHomeError && <Text style={{ color: "red" }}>{createHomeError}</Text>}
          <Button
            title={creatingHome ? "Creating..." : "Create Home"}
            onPress={handleCreateHome}
            disabled={creatingHome}
          />
        </View>
      )}

      {currentHomeDetails.home_details && <Text style={{ fontSize: 20 }}>{currentHomeDetails.home_details.name}</Text>}

      {currentHomeDetails.homes && (
        <Dropdown
          data={dropdownData}
          labelField="label"
          valueField="value"
          value={selectedHome}
          onChange={(item) => {
            setSelectedHome(item.value);
          }}
        />
      )}

      {selectedHome && (
        <SearchBar
          mode="link"
          placeholder="Search"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/places/search",
              params: {
                originType: "home",
                originId: String(selectedHome),
                originName: currentHomeDetails.home_details?.name ?? "",
              },
            })
          }
        />
      )}

      {currentHomeDetails.rooms && (
        <View>
          {currentHomeDetails.rooms.map((room) => (
            <PlaceRow
              key={room.id}
              item={{ id: room.id, name: room.name, type: "room" }}
              onPress={(item) =>
                router.push({
                  pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
                  params: { nodeType: item.type, nodeId: String(item.id), name: item.name },
                })
              }
            />
          ))}
        </View>
      )}
    </>
  );
}
/**
 *
 * <Text>{currentHomeDetails.home_details.name}</Text>
 * <ul>
 *  {currentHomeDetails.homes.map((home) => {
 *    <li key={home.id}>home.name - home.address</li>
 * })}
 * </ul>
 *
 *
 * <Text>{Rooms}</Text>
 * <ul>
 *  {currentHomeDetails.rooms.map((room) => {
 *    <li key={room.id}>room.name</li>
 * })}
 * </ul>
 *
 *
 */

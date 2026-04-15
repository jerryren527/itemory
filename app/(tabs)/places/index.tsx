import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
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

  console.log("🚀 ~ index.tsx:39 ~ Index ~ currentHomeDetails:", JSON.stringify(currentHomeDetails, null, 2));

  const handlePress = async () => {
    console.log("Pressed!");
    const res = await axios.get(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/place-node/1/1/`);
    // console.log("🚀 ~ index.tsx:8 ~ handlePress ~ res.data:", res.data);
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
      {primaryHome === null && <Text style={{ fontSize: 20 }}>Add a Place</Text>}

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

      {currentHomeDetails.rooms && (
        <View>
          {currentHomeDetails.rooms.map((room) => (
            <Text key={room.id}>{room.name}</Text>
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

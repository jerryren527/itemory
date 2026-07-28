import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

type SearchBarProps =
  | {
      mode: "link";
      placeholder: string;
      onPress: () => void;
    }
  | {
      mode: "active";
      placeholder: string;
      value: string;
      onChangeText: (text: string) => void;
      onSubmit: () => void;
      autoFocus?: boolean;
    };

export default function SearchBar(props: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F3F4",
        borderRadius: 24,
        paddingHorizontal: 14,
        height: 44,
        marginHorizontal: 12,
        marginVertical: 8,
      }}
    >
      <MaterialCommunityIcons name="magnify" size={20} color="grey" />
      {props.mode === "link" ? (
        <TouchableOpacity
          onPress={props.onPress}
          style={{ flex: 1, height: "100%", justifyContent: "center", paddingLeft: 10 }}
        >
          <TextInput
            editable={false}
            pointerEvents="none"
            placeholder={props.placeholder}
            style={{ fontSize: 16, color: "black" }}
          />
        </TouchableOpacity>
      ) : (
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          onSubmitEditing={props.onSubmit}
          returnKeyType="search"
          placeholder={props.placeholder}
          autoFocus={props.autoFocus}
          style={{ flex: 1, height: "100%", paddingLeft: 10, fontSize: 16, color: "black" }}
        />
      )}
    </View>
  );
}

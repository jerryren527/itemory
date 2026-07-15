import AuthContext from "@/context/auth-context";
import React, { useContext } from "react";
import { Button, Text, View } from "react-native";

// DO NOT COMMIT

const Test = () => {
  const { state, dispatch } = useContext(AuthContext);
  console.log("🚀 ~state:", state);

  return (
    <View>
      <Text>Test</Text>
      <Button title="Dispatch INIT action" onPress={() => dispatch({ type: "INIT" })} />
      <Button title="Dispatch LOGOUT action" onPress={() => dispatch({ type: "LOGOUT" })} />
      <Button title="Dispatch SESSION_EXPIRED action" onPress={() => dispatch({ type: "SESSION_EXPIRED" })} />
      <Button
        title="Dispatch SIGNUP_REQUIRES_VERIFICATION action"
        onPress={() => dispatch({ type: "SIGNUP_REQUIRES_VERIFICATION" })}
      />
      <Button
        title="Dispatch LOGIN_REQUIRES_VERIFICATION action"
        onPress={() => dispatch({ type: "LOGIN_REQUIRES_VERIFICATION" })}
      />
      <Button
        title="Dispatch LOGIN_SUCCEEDED action with payload"
        onPress={() => dispatch({ type: "LOGIN_SUCCEEDED", payload: { data: "THIS IS SOME DATAAA!" } })}
      />
      <Button title="Dispatch broken action" onPress={() => dispatch({ type: "broken" })} />
    </View>
  );
};

export default Test;

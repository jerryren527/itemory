import { useAuth } from "@/context/auth-context";
import axios from "axios";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";

const PasswordLoginForm = () => {
  const { message, formEmail, setMessage } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control, // This object contains methods for registering components into React Hook Form.
    handleSubmit, // this function receives the form data if form validation is successful.
    formState: { errors }, // This object contains information about the entire form state. Destructure errors, an object with field errors.
  } = useForm({
    defaultValues: {
      password: "",
    },
  });
  const onSubmit = async (data: any) => {
    setErrorMessage("");
    console.log("🚀 ~onSubmit...");

    const body = {
      email: formEmail,
      password: data.password,
    };

    console.log("🚀 ~body:", body);
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/login`, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🚀 ~res.data", res.data);

      // TODO: After getting access and refresh tokens, redirect to Home page.
      const access_token = res.data["tokens"].access;
      const refresh_token = res.data["tokens"].refresh;
      console.log("🚀 ~access_token:", access_token);
      console.log("🚀 ~refresh_token:", refresh_token);
      // Save to Secure Store
    } catch (err) {
      console.error("err:", err);

      if (axios.isAxiosError(err)) {
        console.log("🚀 ~message:", err.message);

        if (err.response) {
          console.log("🚀 ~status:", err.response.status);
          console.log("🚀 ~data:", err.response.data);
          setErrorMessage(err.response.data?.message ?? "An unexpected error occurred.");
          console.log("🚀 ~headers:", err.response.headers);
        } else if (err.request) {
          console.log("🚀 ~request:", err.request);
        } else {
          console.log("🚀 ~config:", err.config);
        }
      }
    }
  };

  return (
    <View>
      <Text>{errorMessage && errorMessage}</Text>
      <Controller
        control={control} // pass in the control object
        rules={{
          // Pass in validation rules
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          // render prop is a funciton that returns a React element and provides the ability to attach events and value into the component.
          <TextInput
            placeholder="Password" // attach values
            onBlur={onBlur} // attach events
            onChangeText={onChange} // attach events
            value={value} // attach values
            style={{
              borderColor: "black",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 250,
            }}
            secureTextEntry // To hide the password while typing it
          />
        )}
        name="password"
      />
      {errors.password && <Text>{errors.password.message}</Text>}

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

export default PasswordLoginForm;

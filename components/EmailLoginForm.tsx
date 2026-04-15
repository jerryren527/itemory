import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";

type FormData = {
  firstName: string;
};

export default function EmailLoginForm() {
  const router = useRouter();
  const { message, setMessage, formEmail, setFormEmail } = useAuth();

  const {
    control, // This object contains methods for registering components into React Hook Form.
    handleSubmit, // this function receives the form data if form validation is successful.
    formState: { errors }, // This object contains information about the entire form state. Destructure errors, an object with field errors.
  } = useForm({
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data: any) => {
    console.log("🚀 ~inside onSubmit...");
    console.log("🚀 ~data:", data);

    const body = {
      email: data.email,
    };

    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/check-email`, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🚀 ~res.data:", res.data);

      const email_status = res.data["email_status"];
      console.log("🚀 ~email_status:", email_status);

      setMessage(res.data["message"]);
      setFormEmail(data.email);

      if (email_status === 2) {
        // Email not in database
        // Go to /SignUpPage with query params.
        router.push({
          pathname: "/SignUpPage",
        });
      }
      // TODO: email_status == 1
      // TODO: email_status == 0 (Password login available)
      else if (email_status === 0) {
        router.push({
          pathname: "/PasswordLoginPage",
        });
      }
    } catch (err) {
      console.log("🚀 ~err:", err);
      if (axios.isAxiosError(err)) {
        console.log("🚀 ~message:", err.message);

        if (err.response) {
          console.log("🚀 ~status:", err.response.status);
          console.log("🚀 ~data:", err.response.data);
          console.log("🚀 ~headers:", err.response.headers);
        } else if (err.request) {
          console.log("🚀 ~request:", err.request);
        } else {
          console.log("🚀 ~config:", err.config);
        }
      }
    }
  };

  const sendRequest = async () => {
    console.log("🚀 ~sending request...");
    // const backendUrl = process.env["BACKEND_URL"];
    console.log(`${process.env.EXPO_PUBLIC_BACKEND_URL}`);
    // console.log(GOOGLE_CLIENT_ID);
    // const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/app`);
    const res = await axios.get(`http://192.168.0.104:8000/app`);
    console.log("🚀 ~res", res.data);
  };

  return (
    <View>
      <Text style={{ color: "red" }}>{message && message}</Text>
      <Controller
        control={control} // pass in the control object
        rules={{
          // Pass in validation rules
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          // render prop is a funciton that returns a React element and provides the ability to attach events and value into the component.
          <TextInput
            placeholder="Email Address" // attach values
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
          />
        )}
        name="email"
      />
      {errors.email && <Text>This is required.</Text>}

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

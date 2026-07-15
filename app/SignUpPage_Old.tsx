import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";

// DO NOT COMMIT

// type SignUpPageProps = {
//   form_email?: string;
// };

export default function SignUpPage() {
  const router = useRouter();
  // Get query params (https://docs.expo.dev/versions/latest/sdk/router/#uselocalsearchparams)
  // const { message } = useLocalSearchParams();

  // instead of using query params, which is an anti-pattern (https://reactnavigation.org/docs/params/#what-should-be-in-params), use React Context API
  const { message, formEmail, setMessage, user, userState, capabilities, tokens } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // logging new AuthContext fields
  console.log("🚀 ~🚀 ~ SignUpPage ~ tokens:", tokens);
  console.log("🚀 ~🚀 ~ SignUpPage ~ capabilities:", capabilities);
  console.log("🚀 ~🚀 ~ SignUpPage ~ userState:", userState);

  const onSubmit = async (data: any) => {
    // Only value form data (email address string is valid, password is at least 8 characters long, and confirmPassword matches password.)
    console.log("🚀 ~onSubmit..");
    // console.log("🚀 ~data:", data);

    console.log("🚀 ~formEmail");
    const body = {
      email: formEmail || "",
      password: data.password,
    };

    console.log("🚀 ~body:", body);

    // Call Register route from backend.
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/register`, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🚀 ~res.data:", res.data);

      // Navigate to EmailLoginForm
      setMessage("Please check your email and click on the verification link!");
      router.push({
        pathname: "/EmailLoginPage",
      });
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

  const {
    control, // This object contains methods for registering components into React Hook Form.
    handleSubmit, // this function receives the form data if form validation is successful.
    watch, // observe the value of form fields
    formState: { errors }, // This object contains information about the entire form state. Destructure errors, an object with field errors.
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password"); // watch a single form field

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "red" }}>{message && message}</Text>
      <Text style={{ color: "orage" }}>{errorMessage && errorMessage} </Text>
      <Text>SignUpPage</Text>

      {/* <Controller
        control={control} // pass in the control object
        rules={{
          // Pass in validation rules
          required: {
            value: true,
            message: "Email is required",
          }, // shows this error when Email field is empty
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email is not valid.", // show this error when email string is not valid. access via errors.email.message
          },
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
      /> */}
      {/* {errors.email && <Text>{errors.email.message}</Text>} */}

      <TextInput
        value={formEmail || ""} // attach values
        style={{
          borderColor: "black",
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          width: 250,
        }}
        readOnly={true}
      />

      <Controller
        control={control} // pass in the control object
        rules={{
          // Pass in validation rules
          required: {
            value: true,
            message: "Password is required.",
          },
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters long.",
          },
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

      <Controller
        control={control}
        rules={{
          required: "Confirm Password is required.",
          validate: (value) => value === passwordValue || "Passwords do not match.",
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Confirm Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={{
              borderColor: "black",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 250,
            }}
            secureTextEntry
          />
        )}
        name="confirmPassword"
      />
      {errors.confirmPassword && <Text>{errors.confirmPassword.message}</Text>}

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

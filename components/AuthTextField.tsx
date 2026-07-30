import { useAuthTheme } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

type AuthTextFieldProps = {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
  label?: string;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  isPassword?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  inputMode?: TextInputProps["inputMode"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(function AuthTextField(
  {
    control,
    name,
    rules,
    label,
    placeholder,
    icon,
    isPassword = false,
    autoCapitalize = "none",
    autoCorrect = false,
    inputMode,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
  },
  ref,
) {
  const { AuthColors, AuthStyles } = useAuthTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hideText, setHideText] = useState(isPassword);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={AuthStyles.fieldWrapper}>
          {label && <Text style={AuthStyles.fieldLabel}>{label}</Text>}
          <View
            style={[
              AuthStyles.inputShell,
              isFocused && AuthStyles.inputShellFocused,
              !!error && AuthStyles.inputShellError,
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={isFocused ? AuthColors.iconFocused : AuthColors.icon}
              style={AuthStyles.inputIcon}
            />
            <TextInput
              ref={ref}
              placeholder={placeholder}
              placeholderTextColor={AuthColors.placeholder}
              style={AuthStyles.input}
              value={value}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              secureTextEntry={hideText}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              inputMode={inputMode}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              blurOnSubmit={blurOnSubmit}
            />
            {isPassword && (
              <Pressable onPress={() => setHideText((v) => !v)} style={AuthStyles.inputTrailingIcon} hitSlop={8}>
                <MaterialCommunityIcons name={hideText ? "eye-off" : "eye"} size={20} color={AuthColors.icon} />
              </Pressable>
            )}
          </View>
          {error?.message && <Text style={AuthStyles.fieldErrorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
});

import { useAuthTheme } from "@/styles/auth.styles";
import { Control, Controller } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps {
  control: Control<any>; // control is an object of any shape that RHF uses to manage values, errors, validations of a form.
  name: string;
  label: string;
  rules?: object;
  inputProps?: TextInputProps;
}

export function FormInput({ control, name, label, rules, inputProps }: FormInputProps) {
  const { AuthStyles } = useAuthTheme();
  return (
    <View>
      <Controller
        control={control} // We pass control object to Controller so RHF knows the input field belongs to the form.
        name={name}
        rules={rules}
        // Controller produces the field and fieldState objects, each with specific properties. field's onChange, onBlur, value are necessary for RHF to connect input to the form state. formState's error is error for this specific input.
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <Text>
              {label}
              {error && <Text> ({error.message})</Text>}
            </Text>

            <TextInput style={AuthStyles.input} onBlur={onBlur} onChangeText={onChange} value={value} {...inputProps} />
          </>
        )}
      />
    </View>
  );
}

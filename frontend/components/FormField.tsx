import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { formStyles } from "@/styles/formStyles";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e?: any) => void;
  onFocus?: (e?: any) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  required?: boolean;
  helperText?: string;
  maxLength?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  accessibilityLabel?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = "default",
  required = false,
  helperText,
  maxLength,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  accessibilityLabel,
}) => {
  const isError = touched && !!error;
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = (e?: any) => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e?: any) => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    onBlur?.(e);
  };

  return (
    <View style={formStyles.field}>
      <Text
        style={formStyles.label}
        accessibilityLabel={`${label}${required ? " required" : ""}`}
      >
        {label}
        {required && <Text style={{ color: color.primary }}> *</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <Animated.View
          style={[
            formStyles.input,
            isFocused && formStyles.inputFocused,
            isError && formStyles.errorInput,
            !editable && styles.disabledInput,
            {
              // Animation de l'élévation
              transform: [{
                scale: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.01],
                })
              }],
            }
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              secureTextEntry && { paddingRight: 40 },
            ]}
            value={value}
            onChangeText={onChangeText}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            placeholderTextColor={color.textMuted}
            secureTextEntry={isSecure}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            accessible={true}
            accessibilityLabel={accessibilityLabel || label}
          />
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsSecure(!isSecure)}
              activeOpacity={0.6}
            >
              <TabBarIcon
                name={isSecure ? "eye-slash" : "eye"}
                size={20}
                color={isFocused ? color.secondary : color.textMuted}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
      {error && isError && (
        <Text
          style={formStyles.errorText}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      {!error && helperText && (
        <Text style={formStyles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: color.text,
    minHeight: 24, // Pour éviter l'écrasement sur certains devices
    fontWeight: "600",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
  disabledInput: {
    backgroundColor: color.disabledBg,
    borderColor: color.border,
    opacity: 0.7,
  },
});

export default FormField;


import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { formStyles } from '@/styles/formStyles';
import { TabBarIcon } from '@/components/TabBarIcon';
import { color } from '@/constant/color';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e?: any) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  required?: boolean;
  helperText?: string;
  maxLength?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = 'default',
  required = false,
  helperText,
  maxLength,
  editable = true,
  multiline = false,
  numberOfLines = 1
}) => {
  const isError = touched && !!error;
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={formStyles.field}>
      <Text style={formStyles.label}>
        {label}
        {required && <Text style={{ color: '#e74c3c' }}>*</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            formStyles.input,
            isError && formStyles.errorInput,
            !editable && { backgroundColor: '#f0f0f0', color: '#888' },
            secureTextEntry && { paddingRight: 40 }
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={color.textLight}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure(!isSecure)}
          >
            <TabBarIcon name={isSecure ? "eye-slash" : "eye"} size={20} color={color.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {error && isError && (
        <Text style={formStyles.errorText}>{error}</Text>
      )}
      {!error && helperText && (
        <Text style={formStyles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  }
});

export default FormField;

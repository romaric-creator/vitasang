import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { formStyles } from '../styles/formStyles';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: SelectOption[];
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onSelect,
  options,
  error,
  touched,
  required = false,
  placeholder
}) => {
  const isError = touched && !!error;

  return (
    <View style={formStyles.field}>
      <Text style={formStyles.label}>
        {label}
        {required && <Text style={{ color: '#e74c3c' }}>*</Text>}
      </Text>
      <ScrollView 
        style={[
          formStyles.groupSegment,
          isError && { borderColor: '#e74c3c' }
        ]}
        scrollEnabled={false}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              formStyles.groupOption,
              value === option.value && formStyles.groupOptionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                formStyles.groupOptionText,
                value === option.value && formStyles.groupOptionTextSelected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error && isError && (
        <Text style={formStyles.errorText}>{error}</Text>
      )}
    </View>
  );
};

export default SelectField;

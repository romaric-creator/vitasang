import { StyleSheet } from 'react-native';
import { color } from '../constant/color';

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: color.background
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    color: color.textMain,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: color.textMain,
    backgroundColor: color.surface,
  },
  inputFocused: {
    borderColor: color.primary,
    backgroundColor: color.surface,
  },
  errorInput: {
    borderColor: color.error,
    backgroundColor: color.dangerLight
  },
  errorText: {
    fontSize: 11,
    color: color.error,
    marginTop: 4,
    fontWeight: '500',
  },
  successText: {
    fontSize: 11,
    color: color.success,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: color.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16
  },
  // Reusing component-specific buttons if needed, but primary is in PrimaryButton.tsx
  groupSegment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  groupOption: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  groupOptionSelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  groupOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: color.textMain
  },
  groupOptionTextSelected: {
    color: color.textWhite
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  checkboxChecked: {
    backgroundColor: color.primary,
    borderColor: color.primary
  },
  checkboxText: {
    fontSize: 13,
    color: color.textMain,
    flex: 1,
    fontWeight: '500',
  },
  picker: {
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 12,
    backgroundColor: color.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  flexHalf: {
    flex: 1
  }
});

export const getFieldStatus = (
  field: string,
  errors: { [key: string]: string },
  touched: { [key: string]: boolean }
) => {
  const hasError = touched[field] && !!errors[field];
  return {
    isError: hasError,
    errorMessage: hasError ? errors[field] : '',
    isTouched: touched[field]
  };
};

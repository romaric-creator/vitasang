import { StyleSheet } from "react-native";
import { color } from "../constant/color";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: color.background,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: color.textMain,
    letterSpacing: 0.1,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: color.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  inputFocused: {
    backgroundColor: color.surface,
    borderColor: color.primary,
    shadowColor: "transparent",
  },
  errorInput: {
    borderColor: color.error,
    backgroundColor: color.errorLight,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: color.error,
    marginTop: 4,
    fontWeight: "500",
    paddingLeft: 2,
  },
  successText: {
    fontSize: 12,
    color: color.success,
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: color.textSecondary,
    marginTop: 6,
    paddingLeft: 2,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  groupSegment: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  groupOption: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.surface,
  },
  groupOptionSelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  groupOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: color.textMain,
  },
  groupOptionTextSelected: {
    color: "white",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: color.surfaceHighlight,
    padding: 12,
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: color.border,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.surface,
  },
  checkboxChecked: {
    backgroundColor: color.secondary,
    borderColor: color.secondary,
  },
  checkboxText: {
    fontSize: 15,
    color: color.textMain,
    flex: 1,
    fontWeight: "600",
  },
  picker: {
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 16,
    backgroundColor: color.surfaceDark,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  flexHalf: {
    flex: 1,
  },
});


export const getFieldStatus = (
  field: string,
  errors: { [key: string]: string },
  touched: { [key: string]: boolean },
) => {
  const hasError = touched[field] && !!errors[field];
  return {
    isError: hasError,
    errorMessage: hasError ? errors[field] : "",
    isTouched: touched[field],
  };
};

import { StyleSheet } from "react-native";
import { color } from "../constant/color";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: color.background,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
    color: color.secondaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: color.borderLight, // Très doux, presque invisible
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: color.text,
    backgroundColor: color.surfaceDark, // Gris très clair pour le fond
    // Modern Shadow (plus vivante)
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputFocused: {
    borderColor: color.secondary,
    backgroundColor: color.surface,
    borderWidth: 2,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  errorInput: {
    borderColor: color.error,
    backgroundColor: color.errorLight,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 13,
    color: color.error,
    marginTop: 8,
    fontWeight: "600",
    paddingLeft: 4,
  },
  successText: {
    fontSize: 13,
    color: color.success,
    marginTop: 8,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: color.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
    paddingLeft: 4,
  },
  buttonContainer: {
    marginTop: 32,
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
    minWidth: "30%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: color.borderLight,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.surface,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  groupOptionSelected: {
    backgroundColor: color.secondary,
    borderColor: color.secondary,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  groupOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  groupOptionTextSelected: {
    color: color.surface,
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
    borderColor: color.borderLight,
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

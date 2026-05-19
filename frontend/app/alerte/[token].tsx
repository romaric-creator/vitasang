import { Redirect, useLocalSearchParams } from "expo-router";

export default function AlerteRedirect() {
  const { token } = useLocalSearchParams<{ token: string }>();
  return <Redirect href={`/alert-public/${token}`} />;
}

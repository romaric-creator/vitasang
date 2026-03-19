import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";
import { color } from "@/constant/color";
import axios from "axios";

const DebugApiScreen = () => {
  // Only render in development mode
  if (!__DEV__) {
    return null;
  }

  const [statusData, setStatusData] = useState({
    apiUrl: "",
    backendStatus: "checking",
    backendMessage: "",
    corsStatus: "checking",
    corsMessage: "",
  });

  useEffect(() => {
    checkApi();
  }, []);

  const checkApi = async () => {
    const apiUrl =
      Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL ||
      "NOT_CONFIGURED";

    setStatusData((prev) => ({ ...prev, apiUrl }));

    if (apiUrl === "NOT_CONFIGURED") {
      setStatusData((prev) => ({
        ...prev,
        backendStatus: "error",
        backendMessage:
          "EXPO_PUBLIC_API_BASE_URL not found in app.json > extra > env",
      }));
      return;
    }

    // Test connexion backend
    try {
      const response = await axios.get(apiUrl.replace("/api", ""), {
        timeout: 5000,
      });
      setStatusData((prev) => ({
        ...prev,
        backendStatus: "success",
        backendMessage: `✓ Backend responded: ${response.status}`,
      }));
    } catch (error: any) {
      setStatusData((prev) => ({
        ...prev,
        backendStatus: "error",
        backendMessage: `✗ Backend error: ${error.message}`,
      }));
    }

    // Test CORS
    try {
      const response = await axios.get(apiUrl.replace("/api", "/"), {
        timeout: 5000,
      });
      setStatusData((prev) => ({
        ...prev,
        corsStatus: "success",
        corsMessage: `✓ CORS enabled: ${response.headers["access-control-allow-origin"]}`,
      }));
    } catch (error: any) {
      setStatusData((prev) => ({
        ...prev,
        corsStatus: "error",
        corsMessage: `✗ CORS error: ${error.message}`,
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 API Debug Console</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.configBox}>
          <Text style={styles.label}>API URL from app.json:</Text>
          <Text style={styles.code}>{statusData.apiUrl}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend Health</Text>
        <View
          style={[styles.statusBox, getStatusStyle(statusData.backendStatus)]}
        >
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {statusData.backendStatus === "checking"
                ? "⏳"
                : statusData.backendStatus === "success"
                  ? "✅"
                  : "❌"}
            </Text>
            <Text style={styles.statusText}>{statusData.backendMessage}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CORS Status</Text>
        <View style={[styles.statusBox, getStatusStyle(statusData.corsStatus)]}>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {statusData.corsStatus === "checking"
                ? "⏳"
                : statusData.corsStatus === "success"
                  ? "✅"
                  : "❌"}
            </Text>
            <Text style={styles.statusText}>{statusData.corsMessage}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Fixes</Text>
        <View style={styles.fixBox}>
          <Text style={styles.fixTitle}>
            1️⃣ For Local Development (Simulator)
          </Text>
          <Text style={styles.fixText}>
            Update app.json:{"\n"}
            "EXPO_PUBLIC_API_BASE_URL": "http://127.0.0.1:3000/api"
          </Text>
        </View>

        <View style={styles.fixBox}>
          <Text style={styles.fixTitle}>2️⃣ For Physical Device</Text>
          <Text style={styles.fixText}>
            Update app.json:{"\n"}
            "EXPO_PUBLIC_API_BASE_URL": "http://10.37.82.208:3000/api"
          </Text>
        </View>

        <View style={styles.fixBox}>
          <Text style={styles.fixTitle}>3️⃣ After Changing app.json</Text>
          <Text style={styles.fixText}>
            • Stop npm start{"\n"}• npm start again{"\n"}• In Expo, press 'r' to
            reload
          </Text>
        </View>

        <View style={styles.fixBox}>
          <Text style={styles.fixTitle}>4️⃣ Backend Not Running?</Text>
          <Text style={styles.fixText}>
            cd backend{"\n"}
            npm start
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={checkApi}>
        <Text style={styles.testButtonText}>🔄 Test Again</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Current IP: 10.37.82.208{"\n"}
          Backend Port: 3000{"\n"}
          Full URL: http://10.37.82.208:3000/api
        </Text>
      </View>
    </ScrollView>
  );
};

export default DebugApiScreen;

function getStatusStyle(status: string) {
  switch (status) {
    case "success":
      return { backgroundColor: "#F0FDF4", borderColor: "#10B981" };
    case "error":
      return { backgroundColor: "#FFF5F5", borderColor: "#EF4444" };
    default:
      return { backgroundColor: "#F5F3FF", borderColor: "#A78BFA" };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    backgroundColor: color.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 12,
  },
  configBox: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  label: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  code: {
    fontSize: 13,
    fontFamily: "monospace",
    color: color.textMain,
    fontWeight: "700",
    backgroundColor: color.background,
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  statusBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: color.textMain,
    flex: 1,
    flexWrap: "wrap",
  },
  fixBox: {
    backgroundColor: color.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  fixTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 8,
  },
  fixText: {
    fontSize: 12,
    color: color.textSecondary,
    fontFamily: "monospace",
    fontWeight: "600",
    lineHeight: 18,
  },
  testButton: {
    marginHorizontal: 16,
    backgroundColor: color.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  testButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    marginHorizontal: 16,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  footerText: {
    fontSize: 12,
    color: color.textSecondary,
    fontFamily: "monospace",
    fontWeight: "600",
    lineHeight: 18,
  },
});

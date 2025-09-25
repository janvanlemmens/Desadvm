import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Realm from "realm";
import CustomPressable from "../components/CustomPressable";
import DeviceInfo from "react-native-device-info";
/*
const api = axios.create();

api.interceptors.request.use((config) => {
  console.log("[Request]", config);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[Response]", res);
    return res;
  },
  (err) => {
    console.log("[Error]", err);
    return Promise.reject(err);
  }
);
*/

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState("");
  const [checkingToken, setCheckingToken] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  console.log("api", apiUrl);

  useEffect(() => {
    const logDevice = async () => {
      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();
      const systemName = DeviceInfo.getSystemName();
      const systemVersion = DeviceInfo.getSystemVersion();
      setBrand(brand);

      console.log(
        `Running on: ${brand} ${model} (${systemName} ${systemVersion})`
      );
      //Running on: unitech EA520 (Android 11)
      //npx react-native run-android => new android/app/build/outputs/apk/debug/app-debug.apk
      //cd android ./gradlew assembleRelease (niet is bare workflow)
      //adb install android/app/build/outputs/apk/release/app-release.apk
      //eas build -p android --profile preview --local
      //adb push /Users/janvanlemmens/RNDev/desadvm/build-1758549397084.apk /sdcard/Download
      //adb logcat | grep ReactNativeJS
    };

    logDevice(); // ✅ actually run it
    let mounted = true;

    (async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log("Stored token:", token);
        if (!token) return;

        // Verifieer token bij je API (pas URL aan naar jouw endpoint)
        const res = await axios.get(`${apiUrl}/rest.desadv.cls?func=verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!mounted) return;

        console.log("response", res.data);

        // Stel dat API { success: true, uname, depot, ... } teruggeeft als token ok is
        if (res.data?.success) {
          // Eventueel state/storage bijwerken met profielinfo
          if (res.data.uname)
            await SecureStore.setItemAsync("uname", res.data.uname);
          if (res.data.depot)
            await SecureStore.setItemAsync("depot", res.data.depot);
          onLogin(); // -> direct door naar app
          return;
        } else {
          // Ongeldig token opruimen
          await SecureStore.deleteItemAsync("token");
        }
      } catch (e) {
        // Netwerk/401 -> token ongeldig: opruimen
        try {
          await SecureStore.deleteItemAsync("token");
        } catch {}
        console.warn("Token check failed:", e?.message || e);
      } finally {
        if (mounted) setCheckingToken(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl + "/rest.desadv.cls?func=login",
        {
          user: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Assume response contains { success: true } if login is valid

      if (response.data.success) {
        await SecureStore.setItemAsync("depot", response.data.depot);
        await SecureStore.setItemAsync("brand", brand);
        await SecureStore.setItemAsync("uname", response.data.uname);
        await SecureStore.setItemAsync("token", response.data.token);
        onLogin(); // navigate to the main app
      } else {
        Alert.alert(
          "Login Failed",
          response.data.message || "Invalid credentials"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Server error or network issue"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Despatch Advice</Text>
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <CustomPressable
              text="Login"
              borderRadius={18}
              hoverColor="#0EA371" // only on web
              onPress={handleLogin}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 32, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});

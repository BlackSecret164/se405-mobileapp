import { useAuth } from "@/contexts/AuthContext";
import api, { setAccessToken } from "@/services/api";
import { registerPushToken } from "@/services/notificationApi";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  // Check if form is valid for button styling
  const isFormValid = username.trim() !== "" && password !== "";

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Error", "Please enter all required fields");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const { user, access_token, refresh_token } = res.data;

      await SecureStore.setItemAsync("refresh_token", refresh_token);
      setAccessToken(access_token);

      // Set user in auth context
      setUser(user);

      // Register push token with backend (now that user is authenticated)
      await registerPushToken();

      if (user.is_new_user) {
        router.replace("/welcome");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.log("[Login Error]", err);
      console.log("[Login Error Response]", err.response?.data);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "An error occurred";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.logo}>Iamstagram</Text>

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

        <TouchableOpacity
          style={[styles.button, isFormValid && styles.buttonActive]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Log in"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => router.push("/register")}>
          Don’t have an account? Sign up
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 36, textAlign: "center", marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#9ad0f5",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonActive: {
    backgroundColor: "#3797ef",
  },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "600" },
  link: { textAlign: "center", marginTop: 24, color: "#3797ef" },
});

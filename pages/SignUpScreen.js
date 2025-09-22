import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE } from "../config";
import { ROUTES } from "../constants";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
  });

  const handleSignUp = async () => {
    const newErrors = {
      username: !username,
      email: !email || !isValidEmail(email),
      password: !password,
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Account with that information already exists");
        } else {
          throw new Error("Error occurred during registration");
        }
      }

      const data = await response.json();

      if (data && data.token) {
        await AsyncStorage.setItem("token", data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: ROUTES.HOME }],
        });
      } else {
        Alert.alert("Success", "Account created, but no token returned!");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <ImageBackground
      source={require("../assets/travel-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account 🧳</Text>
          <Text style={styles.subtitle}>Join and start your journeys</Text>

          <View
            style={[
              styles.inputContainer,
              errors.username && { borderColor: "red", borderWidth: 1.5 },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              errors.email && { borderColor: "red", borderWidth: 1.5 },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#888"
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              errors.password && { borderColor: "red", borderWidth: 1.5 },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.outlineButtonText}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  outlineButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 15,
  },
});

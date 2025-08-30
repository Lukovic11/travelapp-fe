import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ROUTES } from "../constants";
import { API_BASE } from "../config";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);

    const token = await AsyncStorage.getItem("token"); 
    if (!token) {
      throw new Error("No token found, please login again");
    }

    const response = await fetch(`${API_BASE}/api/trip/user`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
      if (!response.ok) {
        throw new Error("Error fetching the trip");
      }
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const renderTrip = ({ item }) => (
    <TouchableOpacity
      style={styles.tripContainer}
      onPress={() => navigation.navigate(ROUTES.TRIPS, { trip: item })}
    >
      <Text style={styles.tripName}>
        {item.id} {item.title}
      </Text>
      <Text style={styles.tripDates}>
        {item.dateFrom} - {item.dateTo}
      </Text>
      <Text style={styles.tripLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

  
   const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.replace(ROUTES.LOGIN);
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginRight: 0}}
          onPress={() =>
            Alert.alert(
              "Log out",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log out",
                  style: "destructive",
                  onPress: handleLogout,
                },
              ],
              { cancelable: true }
            )
          }
        >
          <Icon
            name="exit-outline"
            size={24}
            color="#FF3B30"
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My trips</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrip}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate(ROUTES.ADD_TRIP)}
      >
        <MaterialIcons name="flight" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, marginBottom: 16 },
  tripContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tripName: { fontSize: 18, fontWeight: "bold" },
  tripDates: { fontSize: 14, color: "#555" },
  tripLocation: { fontSize: 14, color: "#777" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#9b9fa5ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "bold",
  },
});

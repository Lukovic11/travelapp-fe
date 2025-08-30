import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  View,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_BASE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditExperienceScreen({ navigation, route }) {
  const { experienceId, tripStart, tripEnd } = route.params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [dateTemp, setDateTemp] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const tripStartDate = new Date(tripStart);
  const tripEndDate = new Date(tripEnd);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please login again");
        }

        const response = await fetch(
          `${API_BASE}/api/experience/${experienceId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Could not fetch experience");

        const data = await response.json();

        setTitle(data.title || "");
        setDescription(data.description || "");
        setDate(data.date ? new Date(data.date) : new Date());
        setDateTemp(data.date ? new Date(data.date) : new Date());
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not load experience.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [experienceId]);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (
        selectedDate &&
        (selectedDate < tripStartDate || selectedDate > tripEndDate)
      ) {
        Alert.alert(
          "Invalid date",
          `Experience date must be after trip start ${tripStartDate} and beforw trip end ${tripEndDate}.`,
          [{ text: "OK" }]
        );
        return;
      }
      setShowDatePicker(false);
      if (selectedDate) setDate(selectedDate);
    } else {
      if (selectedDate) setDateTemp(selectedDate);
    }
  };

  const confirmDateiOS = () => {
    setDate(dateTemp);
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title cannot be empty.", [{ text: "OK" }]);
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, please login again");
      }

      const response = await fetch(`${API_BASE}/api/experience`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: experienceId,
          title,
          description,
          date: date.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error("Could not update experience");
      const updatedExp = await response.json();
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Experience</Text>

      <TextInput
        style={styles.input}
        placeholder="Experience title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{date.toLocaleDateString("en-GB")}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <>
          <DateTimePicker
            value={Platform.OS === "ios" ? dateTemp : date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
            minimumDate={tripStartDate}
            maximumDate={tripEndDate}
          />
          {Platform.OS === "ios" && (
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setDateTemp(date);
                  setShowDatePicker(false);
                }}
              />
              <Button title="OK" onPress={confirmDateiOS} />
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleSave}>
        <Text style={styles.doneText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  doneButton: {
    backgroundColor: "#2196f3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

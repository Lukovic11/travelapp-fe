import React, { useState } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_BASE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddExperienceScreen({ navigation, route }) {
  const { tripId, tripStart, tripEnd } = route.params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const tripStartDate = new Date(tripStart);
  const tripEndDate = new Date(tripEnd);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Experience title cannot be empty.", [
        { text: "OK" },
      ]);
      return;
    }

    const experienceToSave = {
      title,
      description,
      date: formatDate(date),
      tripId,
    };

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found, please login again");
    }

    try {
      const response = await fetch(`${API_BASE}/api/experience`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(experienceToSave),
      });

      if (!response.ok) {
        throw new Error("There was an error while saving the experience.");
      }

      await response.json();

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "There was an error while saving the experience.",
        [{ text: "OK" }]
      );
    }
  };

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
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmDateiOS = () => {
    setDate(tempDate);
    setShowDatePicker(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add experience</Text>

      <TextInput
        style={styles.input}
        placeholder="Experience title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
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
            value={Platform.OS === "ios" ? tempDate : date}
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
                  setTempDate(date);
                  setShowDatePicker(false);
                }}
              />
              <Button title="OK" onPress={confirmDateiOS} />
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
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
  saveButton: {
    backgroundColor: "#9b9fa5ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

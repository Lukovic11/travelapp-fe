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

export default function AddTripScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [dateFromTemp, setDateFromTemp] = useState(new Date());
  const [dateToTemp, setDateToTemp] = useState(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const validateDates = (from, to) => from <= to;

  const handleDone = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Trip title cannot be empty.", [{ text: "OK" }]);
      return;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Location cannot be empty.", [{ text: "OK" }]);
      return;
    }
    if (!dateFrom || !dateTo) {
      Alert.alert("Error", "Dates must have valid values.", [{ text: "OK" }]);
      return;
    }

    if (!validateDates(dateFrom, dateTo)) {
      Alert.alert(
        "Error",
        "Start date must be before or the same as the end date.",
        [{ text: "OK" }]
      );
      return;
    }

    const tripToSave = {
      title,
      description,
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo),
      location,
    };

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found, please login again");
    }

    try {
      const response = await fetch(`${API_BASE}/api/trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripToSave),
      });

      if (!response.ok) {
        throw new Error("There was an error while saving the trip.");
      }

      const savedTrip = await response.json();

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "There was an error while saving the trip.",
        [{ text: "OK" }]
      );
    }
  };

  const onChangeDateFrom = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDateFromPicker(false);
      if (selectedDate) {
        if (selectedDate > dateTo) {
          Alert.alert("Invalid dates", "Start date cannot be after end date.", [
            { text: "OK" },
          ]);
          return;
        }
        setDateFrom(selectedDate);
      }
    } else {
      if (selectedDate) setDateFromTemp(selectedDate);
    }
  };

  const onChangeDateTo = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDateToPicker(false);
      if (selectedDate) {
        if (selectedDate < dateFrom) {
          Alert.alert(
            "Invalid dates",
            "End date cannot be before start date.",
            [{ text: "OK" }]
          );
          return;
        }
        setDateTo(selectedDate);
      }
    } else {
      if (selectedDate) setDateToTemp(selectedDate);
    }
  };

  const confirmDateFromiOS = () => {
    if (dateFromTemp > dateTo) {
      Alert.alert("Invalid dates", "Start date cannot be after end date.", [
        { text: "OK" },
      ]);
      setDateFromTemp(dateFrom);
      setShowDateFromPicker(false);
      return;
    }
    setDateFrom(dateFromTemp);
    setShowDateFromPicker(false);
  };

  const confirmDateToiOS = () => {
    if (dateToTemp < dateFrom) {
      Alert.alert("Ivalid dates", "End date cannot be before start date.", [
        { text: "OK" },
      ]);
      setDateToTemp(dateTo);
      setShowDateToPicker(false);
      return;
    }
    setDateTo(dateToTemp);
    setShowDateToPicker(false);
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add trip</Text>

      <TextInput
        style={styles.input}
        placeholder="Trip title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Start date</Text>
      <TouchableOpacity
        onPress={() => setShowDateFromPicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>
          {dateFrom.toLocaleDateString("en-GB")}
        </Text>
      </TouchableOpacity>

      {showDateFromPicker && (
        <>
          <DateTimePicker
            value={Platform.OS === "ios" ? dateFromTemp : dateFrom}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDateFrom}
          />
          {Platform.OS === "ios" && (
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setDateFromTemp(dateFrom);
                  setShowDateFromPicker(false);
                }}
              />
              <Button title="OK" onPress={confirmDateFromiOS} />
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>End date</Text>
      <TouchableOpacity
        onPress={() => setShowDateToPicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>
          {dateTo.toLocaleDateString("en-GB")}
        </Text>
      </TouchableOpacity>

      {showDateToPicker && (
        <>
          <DateTimePicker
            value={Platform.OS === "ios" ? dateToTemp : dateTo}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDateTo}
            minimumDate={dateFrom}
          />
          {Platform.OS === "ios" && (
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => {
                  setDateToTemp(dateTo);
                  setShowDateToPicker(false);
                }}
              />
              <Button title="OK" onPress={confirmDateToiOS} />
            </View>
          )}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneText}>Save</Text>
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
    backgroundColor: "#9b9fa5ff",
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

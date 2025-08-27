import { useState, useEffect } from "react";
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

export default function EditTripScreen({ route, navigation }) {
  const { tripId } = route.params;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [dateFromTemp, setDateFromTemp] = useState(new Date());
  const [dateToTemp, setDateToTemp] = useState(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/trip/${tripId}`);
      if (!response.ok) {
        throw new Error("There was an error while fetching the trip");
      }
      const data = await response.json();
      setTrip(data);

      setTitle(data.title || "");
      setDescription(data.description || "");
      setLocation(data.location || "");

      const fromDate = new Date(data.dateFrom);
      const toDate = new Date(data.dateTo);

      setDateFrom(fromDate);
      setDateTo(toDate);
      setDateFromTemp(fromDate);
      setDateToTemp(toDate);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error while fetching the trip.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const handleSave = async () => {
    if (!validateDates(dateFrom, dateTo)) {
      Alert.alert(
        "Error",
        "Start date must be before or the same as the end date.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const updatedTrip = {
        id: tripId,
        title,
        description,
        dateFrom: formatDate(dateFrom),
        dateTo: formatDate(dateTo),
        location,
      };

      const response = await fetch(`${API_BASE}/api/trip`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrip),
      });

      if (!response.ok) {
        throw new Error("There was an error updating the trip");
      }

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error updating the trip.");
    }
  };

  const validateDates = (fromDate, toDate) => {
    return fromDate <= toDate;
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
      if (selectedDate) {
        setDateFromTemp(selectedDate);
      }
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
      if (selectedDate) {
        setDateToTemp(selectedDate);
      }
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
      Alert.alert("Invalid dates", "End date cannot be before start date.", [
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
    return date.toLocaleDateString("en-CA");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b9fa5ff" />
        <Text style={styles.loadingText}>Učitavam putovanje...</Text>
      </View>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Update trip</Text>

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
        onPress={() => trip && setShowDateFromPicker(true)}
        style={styles.dateButton}
        disabled={!trip}
      >
        <Text style={styles.dateText}>
          {dateFrom.toLocaleDateString("en-GB")}
        </Text>
      </TouchableOpacity>
      {showDateFromPicker && trip && (
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
        onPress={() => trip && setShowDateToPicker(true)}
        style={styles.dateButton}
        disabled={!trip}
      >
        <Text style={styles.dateText}>
          {dateTo.toLocaleDateString("en-GB")}
        </Text>
      </TouchableOpacity>
      {showDateToPicker && trip && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { API_BASE } from "../config";
import TripImage from "../components/TripImage";
import * as ImagePicker from "expo-image-picker";

export default function TripScreen({ navigation, route }) {
  const { trip } = route.params;
  const [tripD, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/trip/${trip.id}`);
      if (!response.ok) {
        throw new Error("Error fetching the trip");
      }
      const data = await response.json();
      setTrip(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTripDetails();
    }, [trip.id])
  );

  const handleAddPhoto = () => {
    setMenuOpen(false);
    const options = [
      {
        text: "Take a photo",
        onPress: async () => {
          const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPerm.granted) {
            alert("Allow camera access!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
            allowsMultipleSelection: true,
          });
          handlePickerResult(result);
        },
      },
      {
        text: "Choose from gallery",
        onPress: async () => {
          const galleryPerm =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!galleryPerm.granted) {
            alert("Allow gallery access!");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7,
            allowsMultipleSelection: true,
          });
          handlePickerResult(result);
        },
      },
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Add photo", "Choose photos", options, {
      cancelable: true,
    });
  };

  const handleEdit = () => {
    setMenuOpen(false);
    if (tripD) {
      navigation.navigate("EditTrip", { tripId: trip.id });
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert("Delete", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/trip/${trip.id}`, {
              method: "DELETE",
            });
            if (response.status === 204) {
              navigation.navigate("Home");
            } else {
              throw new Error("Deletion failed");
            }
          } catch (error) {
            Alert.alert("Error", "Trip cannot be deleted.");
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePickerResult = (pickerResult) => {
    if (pickerResult.canceled || !pickerResult.assets?.length) return;

    setSelectedImages(pickerResult.assets);
    setShowImagePreview(true);
  };

  const uploadAllPhotos = async () => {
    if (selectedImages.length === 0) {
      Alert.alert("Error", "No photos were chosen!");
      return;
    }

    try {
      setUploadingPhoto(true);
      setShowImagePreview(false);

      for (const image of selectedImages) {
        await uploadSinglePhoto(image);
      }

      setSelectedImages([]);
      fetchTripDetails();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error while saving the photos.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const uploadSinglePhoto = async (imageAsset) => {
    const formData = new FormData();
    formData.append("tripId", trip.id);
    formData.append("file", {
      uri: imageAsset.uri,
      name: imageAsset.fileName || `photo-${Date.now()}.jpg`,
      type: imageAsset.type || "image/jpeg",
    });

    const response = await fetch(`${API_BASE}/api/photo`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("There was an error while saving the photo");
    }

    return await response.json();
  };

  const handleDeletePhoto = (photoId) => {
    Alert.alert("Delete", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const response = await fetch(
              `${API_BASE}/api/photo?id=${photoId}`,
              {
                method: "DELETE",
              }
            );
            if (response.status === 204) {
              setSelectedImage(null);
              fetchTripDetails();
            } else {
              throw new Error("Deletion failed");
            }
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "The photo couldn't be deleted.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!tripD) {
    return (
      <View style={styles.container}>
        <Text>The trip couldn't be loaded.</Text>
      </View>
    );
  }

  const tripPhotos = Array.isArray(tripD.photos) ? tripD.photos : [];

  return (
    <View style={styles.container}>
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <Text style={styles.previewTitle}>
              Chosen photos ({selectedImages.length})
            </Text>

            <FlatList
              data={selectedImages}
              keyExtractor={(item, index) => `preview-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item.uri }} style={styles.previewImage} />
              )}
            />

            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[styles.previewButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedImages([]);
                  setShowImagePreview(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.previewButton, styles.uploadButton]}
                onPress={uploadAllPhotos}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save all</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView>
        <Text style={styles.title}>{tripD.title || "Untitled"}</Text>
        <Text style={styles.description}>{tripD.description || ""}</Text>
        <Text style={styles.dates}>
          {tripD.dateFrom || ""} - {tripD.dateTo || ""}
        </Text>
        <Text style={styles.location}>{tripD.location || ""}</Text>

        <Text style={styles.sectionTitle}>Experiences</Text>
        <View style={styles.experienceList}>
          {(tripD.experiences || []).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.experienceContainer}
              onPress={() =>
                navigation.navigate("Experience", { experience: item })
              }
            >
              <Text style={styles.experienceTitle}>{item.title}</Text>
              <Text style={styles.experienceDate}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Photos</Text>

        {tripPhotos.length === 0 ? (
          <Text style={styles.noPhotosText}>No photos were added.</Text>
        ) : (
          <FlatList
            data={tripPhotos}
            keyExtractor={(item, index) =>
              item.id ? `${item.id}-${index}` : `photo-${index}`
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
            renderItem={({ item }) => (
              <TripImage
                imageUrl={`${API_BASE}/photos/${item.imageUrl}`}
                onPress={() => setSelectedImage(item)}
                styles={styles}
              />
            )}
          />
        )}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent={true}>
        <View style={styles.modalContainer}>
          {selectedImage && (
            <>
              <Image
                source={{ uri: `${API_BASE}/photos/${selectedImage.imageUrl}` }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.closeArea}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.closeArea,
                    { backgroundColor: "#ff5252", marginLeft: 10 },
                  ]}
                  onPress={() => handleDeletePhoto(selectedImage.id)}
                >
                  <Text style={styles.closeText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {menuOpen && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity
            style={[styles.fabSmall, { backgroundColor: "#9b9fa5ff" }]}
            onPress={handleAddPhoto}
          >
            <MaterialIcons name="photo-camera" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabSmall, { backgroundColor: "#2196f3" }]}
            onPress={handleEdit}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabSmall, { backgroundColor: "#ff5252" }]}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.fabMain}
        onPress={() => setMenuOpen((prev) => !prev)}
      >
        <MaterialIcons
          name={menuOpen ? "close" : "add"}
          size={32}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", margin: 16 },
  description: { fontSize: 16, marginHorizontal: 16, marginBottom: 8 },
  dates: { fontSize: 14, color: "#555", marginHorizontal: 16, marginBottom: 4 },
  location: {
    fontSize: 14,
    color: "#777",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  experienceList: { marginBottom: 16, marginHorizontal: 16 },
  experienceContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  experienceTitle: { fontSize: 16, fontWeight: "600" },
  experienceDate: { fontSize: 14, color: "#555" },
  photoScroll: { marginVertical: 8, marginLeft: 16 },
  photo: { width: 200, height: 150, marginRight: 12, borderRadius: 8 },
  noPhotosText: { marginHorizontal: 16, color: "#999", fontStyle: "italic" },

  selectedImageContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedImageText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    alignSelf: "center",
  },

  uploadButton: {
    margin: 16,
    padding: 12,
    backgroundColor: "#2196f3",
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  floatingButtonsContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    gap: 15,
  },
  floatingEditButton: {
    backgroundColor: "#9b9fa5ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  floatingDeleteButton: {
    backgroundColor: "#ff5252",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabCamera: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#9b9fa5ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  closeArea: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 10,
  },
  closeText: {
    color: "black",
    fontWeight: "bold",
  },
  floatingMenu: {
    position: "absolute",
    bottom: 100,
    right: 20,
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  fabMain: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#9b9fa5ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewModalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  previewImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  previewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  uploadButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

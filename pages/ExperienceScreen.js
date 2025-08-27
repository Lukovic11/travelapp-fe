import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { API_BASE } from "../config";
import TripImage from "../components/TripImage"; 

export default function ExperienceScreen({ route }) {
  const { experience } = route.params;
  const photos = experience.photos || [];
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{experience.title}</Text>
      <Text style={styles.date}>{experience.date}</Text>
      <Text style={styles.description}>{experience.description}</Text>

      <Text style={styles.sectionTitle}>Photos</Text>
      {photos.length === 0 ? (
        <Text style={styles.noPhotosText}>No photos were added.</Text>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item, index) =>
            item.id ? `${item.id}-${index}` : `photo-${index}`
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoScroll}
          renderItem={({ item }) => (
            <TripImage
              imageUrl={`${API_BASE}/photos/${item.imageUrl}`}
              onPress={() =>
                setSelectedImage(`${API_BASE}/photos/${item.imageUrl}`)
              }
              styles={styles}
            />
          )}
        />
      )}

      <Modal visible={!!selectedImage} transparent={true}>
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: selectedImage, cache: 'force-cache' }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeArea}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  date: { fontSize: 14, color: "#555", marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  photoScroll: { marginVertical: 8 },
  photo: {
    width: 200,
    height: 150,
    marginRight: 12,
    borderRadius: 8,
  },
  imageWrapper: {
    position: "relative",
    width: 200,
    height: 150,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  noPhotosText: { color: "#999", fontStyle: "italic" },
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
});

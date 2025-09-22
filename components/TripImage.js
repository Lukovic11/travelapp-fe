import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";

export default function TripImage({ imageUrl, onPress, styles }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  
  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };
  
  const handleError = (e) => {
    setLoaded(true);
    setError(true);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.imageWrapper}>
        {!loaded && !error && (
          <View style={[styles.photo, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
        
        {error ? (
          <View style={[styles.photo, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
            <Text style={{ color: '#999', textAlign: 'center', fontSize: 12 }}>
              Photo is not available
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl, cache: 'force-cache' }}
            style={styles.photo}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
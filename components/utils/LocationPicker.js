import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { COLORS } from "./Constants";
import CustomText from "./CustomText";
import Icon from "react-native-vector-icons/MaterialIcons";

const LocationPicker = ({ initialLocation, onLocationSelect, disabled }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleMapPress = (event) => {
    if (disabled) return;

    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    if (onLocationSelect) {
      onLocationSelect(coordinate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: initialLocation?.latitude || 6.927079,
            longitude: initialLocation?.longitude || 79.861244,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
          scrollEnabled={!disabled}
          zoomEnabled={!disabled}
          rotateEnabled={!disabled}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable={!disabled}
              onDragEnd={(e) => {
                setSelectedLocation(e.nativeEvent.coordinate);
                onLocationSelect(e.nativeEvent.coordinate);
              }}
            />
          )}
        </MapView>

        {disabled && (
          <View style={styles.disabledOverlay}>
            <Icon name="lock" size={20} color={COLORS.white} />
            <CustomText style={styles.disabledText}>Location Locked</CustomText>
          </View>
        )}

        {!disabled && !selectedLocation && (
          <View style={styles.instructionContainer}>
            <CustomText style={styles.instructionText}>
              Tap on the map to select your home location
            </CustomText>
          </View>
        )}
      </View>

      {selectedLocation && (
        <View style={styles.coordinatesContainer}>
          <CustomText style={styles.coordinatesText}>
            {`${selectedLocation.latitude.toFixed(
              6
            )}, ${selectedLocation.longitude.toFixed(6)}`}
          </CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  disabledText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 5,
  },
  instructionText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: "center",
  },
  coordinatesContainer: {
    padding: 8,
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  coordinatesText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textGray,
  },
});

export default LocationPicker;

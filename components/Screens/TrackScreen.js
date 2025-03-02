import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";

const { width, height } = Dimensions.get("window");

// Location Marker Component
const LocationMarker = ({ isUser = false, style }) => (
  <View style={[styles.markerBase, style]}>
    <View style={isUser ? styles.userMarker : styles.truckMarker}>
      <MaterialIcons
        name={isUser ? "person-pin" : "location-on"}
        size={28}
        color={isUser ? "#007AFF" : "#E84C3D"}
      />
    </View>
    {!isUser && <View style={styles.markerShadow} />}
  </View>
);

// Fake Map Component
const FakeMap = () => (
  <View style={styles.mapContainer}>
    <View style={styles.mapContent}>
      {/* Fake map elements */}
      <View style={styles.waterArea1} />
      <View style={styles.waterArea2} />

      {/* Roads */}
      <View style={styles.roadHorizontal1} />
      <View style={styles.roadHorizontal2} />
      <View style={styles.roadVertical1} />
      <View style={styles.roadVertical2} />

      {/* Landmarks */}
      <View style={styles.parkArea} />
      <View style={styles.buildingArea1} />
      <View style={styles.buildingArea2} />

      {/* User Location Marker */}
      <LocationMarker
        isUser={true}
        style={{ position: "absolute", top: "25%", left: "40%" }}
      />

      {/* Truck Location Marker */}
      <LocationMarker
        style={{ position: "absolute", top: "65%", left: "25%" }}
      />

      {/* Route Line */}
      <View style={styles.routeLine} />

      {/* Distance indicator */}
      <View style={[styles.distancePoint, { left: "35%", top: "54%" }]}>
        <CustomText style={styles.distancePointText}>400m</CustomText>
      </View>
    </View>
  </View>
);

export function TrackScreen({ navigation }) {
  const [trucks, setTrucks] = useState([]);
  const [mapAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    // Simulate fetching truck tracking data
    const mockTrucks = [
      {
        id: 1,
        type: "Garbage Truck",
        licensePlate: "WP-CBK-9562",
        driverName: "A. Perera",
        estimatedTime: "15 min",
        status: "on-route",
        distance: 800,
      },
    ];
    setTrucks(mockTrucks);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <CustomText style={styles.heading}>Truck Tracking</CustomText>
          <CustomText style={styles.subtitle}>
            Monitor nearby waste collection trucks
          </CustomText>
        </View>
      </View>

      <View style={styles.content}>
        {/* Fake Map Section */}
        <Animated.View
          style={[
            styles.mapWrapper,
            {
              opacity: mapAnimation,
              transform: [
                {
                  translateY: mapAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FakeMap />
        </Animated.View>

        {/* Truck List Section */}
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {trucks.map((truck) => (
            <View key={truck.id} style={styles.card}>
              <MaterialIcons
                name="local-shipping"
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.cardContent}>
                <CustomText style={styles.cardTitle} numberOfLines={1}>
                  {truck.type} - {truck.licensePlate}
                </CustomText>
                <View style={styles.statusContainer}>
                  <CustomText style={styles.cardTime}>
                    {truck.distance}m - {truck.estimatedTime}
                  </CustomText>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          truck.status === "on-route"
                            ? COLORS.primary
                            : COLORS.error,
                      },
                    ]}
                  />
                  <CustomText style={styles.statusText}>
                    {truck.status.charAt(0).toUpperCase() +
                      truck.status.slice(1)}
                  </CustomText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapContainer: {
    height: height * 0.35,
    backgroundColor: COLORS.white,
  },
  mapContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  // Map element styles (similar to previous implementation)
  waterArea1: {
    position: "absolute",
    left: 0,
    top: "10%",
    width: "18%",
    height: "40%",
    backgroundColor: "#B2EBF2",
    borderRadius: 10,
  },
  waterArea2: {
    position: "absolute",
    left: 0,
    top: "55%",
    width: "12%",
    height: "25%",
    backgroundColor: "#B2EBF2",
    borderRadius: 8,
  },
  parkArea: {
    position: "absolute",
    right: "10%",
    bottom: "10%",
    width: "15%",
    height: "15%",
    backgroundColor: "#C8E6C9",
    borderRadius: 8,
  },
  buildingArea1: {
    position: "absolute",
    right: "15%",
    top: "20%",
    width: "10%",
    height: "10%",
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
  },
  buildingArea2: {
    position: "absolute",
    left: "25%",
    bottom: "20%",
    width: "8%",
    height: "8%",
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
  },
  roadHorizontal1: {
    position: "absolute",
    left: "5%",
    top: "35%",
    width: "90%",
    height: 12,
    backgroundColor: "#CFD8DC",
    borderRadius: 6,
  },
  roadHorizontal2: {
    position: "absolute",
    left: "10%",
    top: "75%",
    width: "80%",
    height: 12,
    backgroundColor: "#CFD8DC",
    borderRadius: 6,
  },
  roadVertical1: {
    position: "absolute",
    left: "30%",
    top: "20%",
    width: 12,
    height: "60%",
    backgroundColor: "#CFD8DC",
    borderRadius: 6,
  },
  roadVertical2: {
    position: "absolute",
    left: "70%",
    top: "10%",
    width: 12,
    height: "70%",
    backgroundColor: "#CFD8DC",
    borderRadius: 6,
  },
  markerBase: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  markerShadow: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
  },
  userMarker: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  truckMarker: {
    backgroundColor: "rgba(232, 76, 61, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E84C3D",
  },
  routeLine: {
    position: "absolute",
    width: "20%",
    height: 5,
    backgroundColor: "#FF8C00",
    transform: [{ rotate: "45deg" }],
    top: "50%",
    left: "30%",
    borderRadius: 3,
  },
  distancePoint: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  distancePointText: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: "500",
  },
  cardTime: {
    fontSize: 14,
    color: COLORS.textGray,
  },
});

export default TrackScreen;

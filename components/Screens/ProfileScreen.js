import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { auth } from "../utils/firebaseConfig";
import CustomText from "../utils/CustomText";
import { COLORS } from "../utils/Constants";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchUserProfile,
  fetchDistrictsForMunicipalCouncil,
  fetchWardsForDistrict,
  updateUserLocation,
} from "../services/firebaseFirestore";

export default function ProfileScreen({ navigation }) {
  const [userMunicipalCouncil, setUserMunicipalCouncil] = useState("");
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [locationLocked, setLocationLocked] = useState(false);
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards();
    }
  }, [selectedDistrict]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userData = await fetchUserProfile(user.uid);
        if (userData) {
          setUserName(userData.name);
          setUserEmail(userData.email);
          setUserMunicipalCouncil(userData.municipalCouncil);

          if (userData.district && userData.ward) {
            setSelectedDistrict(userData.district);
            setSelectedWard(userData.ward);
            setSelectedDistrictName(userData.districtName);
            setSelectedWardName(userData.wardName);
            setLocationLocked(true);
          }

          await fetchDistricts(userData.municipalCouncil);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    setLoading(false);
  };

  const fetchDistricts = async (municipalCouncilId) => {
    try {
      const districtList = await fetchDistrictsForMunicipalCouncil(
        municipalCouncilId
      );
      setDistricts(districtList);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchWards = async () => {
    try {
      const wardList = await fetchWardsForDistrict(
        userMunicipalCouncil,
        selectedDistrict
      );
      setWards(wardList);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleUpdateUserLocation = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const selectedDistrictData = districts.find(
          (d) => d.id === selectedDistrict
        );
        const selectedWardData = wards.find((w) => w.id === selectedWard);

        const locationData = {
          district: selectedDistrict,
          ward: selectedWard,
          districtName: selectedDistrictData.name,
          wardName: selectedWardData.name,
        };

        await updateUserLocation(user.uid, locationData);

        const locationString = `${selectedWardData.name}, ${selectedDistrictData.name}`;
        await AsyncStorage.setItem("userLocation", locationString);

        setSelectedDistrictName(selectedDistrictData.name);
        setSelectedWardName(selectedWardData.name);
        setLocationLocked(true);
      }
    } catch (error) {
      console.error("Error updating user location:", error);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("userLocation");
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const LocationDisplay = () => (
    <View style={styles.locationDisplay}>
      <View style={styles.locationHeader}>
        <Icon name="location-on" size={24} color={COLORS.primary} />
        <CustomText style={styles.locationLabel}>Current Location</CustomText>
      </View>
      <CustomText style={styles.locationValue}>
        {selectedWardName
          ? `${selectedWardName}, ${selectedDistrictName}`
          : "Location not set"}
      </CustomText>
      {locationLocked && (
        <View style={styles.lockedMessageContainer}>
          <Icon name="lock" size={16} color={COLORS.errorbanner} />
          <CustomText style={styles.lockedMessage}>
            Location is locked. Contact admin to change.
          </CustomText>
        </View>
      )}
    </View>
  );

  const LocationSelector = ({ title, value, onPress, disabled }) => (
    <TouchableOpacity
      style={[styles.selectorButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.selectorContent}>
        <View style={styles.selectorHeader}>
          <Icon
            name={title === "District" ? "location-city" : "location-on"}
            size={20}
            color={disabled ? COLORS.textGray : COLORS.primary}
          />
          <CustomText style={styles.selectorLabel}>{title}</CustomText>
        </View>
        <CustomText
          style={[styles.selectorValue, disabled && styles.disabledText]}
        >
          {value || `Select ${title}`}
        </CustomText>
      </View>
      {!disabled && (
        <Icon name="arrow-drop-down" size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View style={styles.profileIcon}>
                  <Icon name="person" size={40} color={COLORS.primary} />
                </View>
                <View style={styles.profileInfo}>
                  <CustomText style={styles.userName}>{userName}</CustomText>
                  <CustomText style={styles.userEmail}>{userEmail}</CustomText>
                </View>
              </View>

              <View style={styles.locationSection}>
                {locationLocked ? (
                  <LocationDisplay />
                ) : (
                  <>
                    <View style={styles.sectionTitleContainer}>
                      <Icon
                        name="edit-location"
                        size={24}
                        color={COLORS.primary}
                      />
                      <CustomText style={styles.sectionTitle}>
                        Set Your Location
                      </CustomText>
                    </View>

                    <LocationSelector
                      title="District"
                      value={
                        selectedDistrictName ||
                        (selectedDistrict
                          ? districts.find((d) => d.id === selectedDistrict)
                              ?.name
                          : "")
                      }
                      onPress={() => setShowDistrictModal(true)}
                      disabled={locationLocked}
                    />

                    <LocationSelector
                      title="Ward"
                      value={
                        selectedWardName ||
                        (selectedWard
                          ? wards.find((w) => w.id === selectedWard)?.name
                          : "")
                      }
                      onPress={() =>
                        selectedDistrict ? setShowWardModal(true) : null
                      }
                      disabled={locationLocked || !selectedDistrict}
                    />

                    {!locationLocked && selectedDistrict && selectedWard && (
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdateUserLocation}
                      >
                        <Icon name="check" size={20} color={COLORS.white} />
                        <CustomText style={styles.updateButtonText}>
                          Confirm Location
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Icon name="logout" size={20} color={COLORS.white} />
                <CustomText style={styles.signOutText}>Sign Out</CustomText>
              </TouchableOpacity>
            </ScrollView>

            <Modal
              visible={showDistrictModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDistrictModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDistrictModal(false)}
              >
                <View style={styles.modalContent}>
                  <CustomText style={styles.modalTitle}>
                    Select District
                  </CustomText>
                  <ScrollView>
                    {districts.map((district) => (
                      <TouchableOpacity
                        key={district.id}
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedDistrict(district.id);
                          setSelectedDistrictName(district.name);
                          setSelectedWard("");
                          setSelectedWardName("");
                          setShowDistrictModal(false);
                        }}
                      >
                        <CustomText style={styles.modalItemText}>
                          {district.name}
                        </CustomText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            <Modal
              visible={showWardModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowWardModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowWardModal(false)}
              >
                <View style={styles.modalContent}>
                  <CustomText style={styles.modalTitle}>Select Ward</CustomText>
                  <ScrollView>
                    {wards.map((ward) => (
                      <TouchableOpacity
                        key={ward.id}
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedWard(ward.id);
                          setSelectedWardName(ward.name);
                          setShowWardModal(false);
                        }}
                      >
                        <CustomText style={styles.modalItemText}>
                          {ward.name}
                        </CustomText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    padding: 15,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  locationSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 30,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginLeft: 10,
  },
  locationDisplay: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 8,
  },
  locationValue: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 10,
  },
  lockedMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockedMessage: {
    fontSize: 14,
    color: COLORS.errorbanner,
    fontStyle: "italic",
    marginLeft: 6,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: COLORS.textGray,
    marginLeft: 6,
  },
  selectorValue: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 26,
  },
  disabledButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.borderGray,
  },
  disabledText: {
    color: COLORS.textGray,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: COLORS.errorbanner,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  signOutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 15,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.black,
  },
});

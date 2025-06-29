import React, { useState, useCallback } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";

const DonationScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Donation screen refreshed");
    } catch (error) {
      console.error("Error refreshing donation screen:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.heading}>Donations</CustomText>
        <CustomText style={styles.subtitle}>
          Help save young hearts and brave lives
        </CustomText>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]} // Android
            tintColor={COLORS.primary} // iOS
            title="Pull to refresh"
            titleColor={COLORS.primary}
          />
        }
      >
        <View style={styles.card}>
          <Image
            source={require("../../assets/donation.jpg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardBody}>
            <CustomText style={styles.tileTitle}>Why Donate?</CustomText>
            <CustomText style={styles.tileText}>
              Your support helps fund life-saving treatments and essential
              medical care for those in need, including children born with heart
              conditions and cancer patients relying on free public healthcare.
              Every donation brings hope, healing, and a second chance at life.
            </CustomText>
          </View>
        </View>
        <View style={styles.card}>
          <Image
            source={require("../../assets/donation2.jpg")}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardBody}>
            <CustomText style={styles.tileTitle}>
              Where Your Donation Goes
            </CustomText>
            <CustomText style={styles.tileText}>
              Your donation directly supports two of Sri Lanka's most vital
              healthcare causes — the{" "}
              <CustomText style={{ fontWeight: "bold" }}>
                {" "}
                Little Hearts Fund{" "}
              </CustomText>
              , which is building a cardiac and critical care unit for children
              in need of life-saving heart treatment, and the{" "}
              <CustomText style={{ fontWeight: "bold" }}>
                {" "}
                National Cancer Hospital{" "}
              </CustomText>
              , which provides free cancer care to thousands of patients.
              {"\n\n"} Every contribution helps purchase essential medical
              equipment, improve hospital infrastructure, and ensure that
              children and cancer patients receive the urgent care they deserve.
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => navigation.navigate("Donations")}
        >
          <CustomText style={styles.donateButtonText}>Donate Now</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  content: {
    padding: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 50,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 250,
  },
  cardBody: {
    padding: 15,
  },
  tile: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
  },
  tileText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  donateButton: {
    marginTop: -25,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  donateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DonationScreen;

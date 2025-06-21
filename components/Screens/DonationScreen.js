import React from "react";
import { View, SafeAreaView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { COLORS } from "../utils/Constants"; 
import CustomText from "../utils/CustomText"; 

const DonationScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.heading}>Donations</CustomText>
        <CustomText style={styles.subtitle}>
          Donate to support our cause
        </CustomText>
      </View>
      <View style={styles.webViewContainer}>
        <View style={styles.tile}>
          <CustomText style={styles.tileTitle}>Why Donate?</CustomText>
          <CustomText style={styles.tileText}>
            Your donation helps us continue our mission, expand our outreach, and support communities in need.
          </CustomText>
        </View>

        <View style={styles.tile}>
          <CustomText style={styles.tileTitle}>Where Your Donation Goes</CustomText>
          <CustomText style={styles.tileText}>
            Donations fund educational programs, health initiatives, and disaster relief efforts to make a real impact.
          </CustomText>
        </View>

        <TouchableOpacity style={styles.donateButton} onPress={() => navigation.navigate("Donations")}>
          <CustomText style={styles.donateButtonText}>Donate Now</CustomText>
        </TouchableOpacity>
      </View>
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
});

export default DonationScreen;
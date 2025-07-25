import React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";

const Donation = () => {
  const navigation = useNavigation();
  const payHereForm = `
    <html>
      <body onload="document.forms[0].submit()" style="background-color:white;">
        <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
          <input type="hidden" name="merchant_id" value="1211149">
          <input type="hidden" name="return_url" value="https://yourapp.com/return">
          <input type="hidden" name="cancel_url" value="https://yourapp.com/cancel">
          <input type="hidden" name="notify_url" value="https://yourapp.com/notify">
          <input type="hidden" name="order_id" value="DonateOnline500">
          <input type="hidden" name="items" value="Donation">
          <input type="hidden" name="currency" value="LKR">
          <input type="hidden" name="amount" value="500.00">
          <input type="hidden" name="first_name" value="Nisal">
          <input type="hidden" name="last_name" value="Perera">
          <input type="hidden" name="email" value="nisal@email.com">
          <input type="hidden" name="phone" value="0771234567">
          <input type="hidden" name="address" value="123, Street, Colombo">
          <input type="hidden" name="city" value="Colombo">
          <input type="hidden" name="country" value="Sri Lanka">
        </form>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <CustomText style={styles.heading}>Payment</CustomText>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView>
        <View style={styles.section}>
          <CustomText style={styles.optionTitle}>Online Payment</CustomText>
          <View style={styles.webViewContainer}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: payHereForm }}
              startInLoadingState
              renderLoading={() => (
                <ActivityIndicator size="large" color={COLORS.primary} />
              )}
            />
          </View>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.optionTitle}>Bank Transfer</CustomText>
          <View style={styles.bankDetailsBox}>
            <CustomText style={styles.bankLine}>
              <CustomText style={styles.label}>Bank:</CustomText> Bank of Ceylon
            </CustomText>
            <CustomText style={styles.bankLine}>
              <CustomText style={styles.label}>Account Name:</CustomText>{" "}
              VateLanka Foundation
            </CustomText>
            <CustomText style={styles.bankLine}>
              <CustomText style={styles.label}>Account Number:</CustomText>{" "}
              123456789012
            </CustomText>
            <CustomText style={styles.bankLine}>
              <CustomText style={styles.label}>Branch:</CustomText> Kollupitiya
            </CustomText>
            <CustomText style={styles.bankLine}>
              <CustomText style={styles.label}>SWIFT Code:</CustomText> BCEYLKLX
            </CustomText>
          </View>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.optionTitle}>Pay via Lanka QR Code</CustomText>
          <View style={styles.qrBox}>
            <CustomText style={styles.qrNote}>
              Scan the QR code below using your preferred banking app to
              complete the donation.
            </CustomText>
            <Image
              source={require("../../assets/lankaqr.jpeg")}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
    textAlign: "center",
    marginTop: 10,
  },
  backButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: COLORS.primary,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  section: {
    marginBottom: 40,
  },
  webViewContainer: {
    height: 460,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    overflow: "hidden",
  },
  bankDetailsBox: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 25,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 180,
    width: "93%",
    alignSelf: "center",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Elevation for Android
    elevation: 4,
  },
  bankLine: {
    fontSize: 16,
    marginBottom: 6,
    color: COLORS.darkGray,
  },
  label: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  qrBox: {
  backgroundColor: COLORS.white,
  marginHorizontal: 16,
  borderRadius: 12,
  padding: 20,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},
qrNote: {
  fontSize: 14,
  color: COLORS.textGray,
  marginBottom: 16,
  textAlign: "center",
},
qrImage: {
  width: 350,
  height: 350,
},
});

export default Donation;

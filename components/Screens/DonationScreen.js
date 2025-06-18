import React from "react";
import { View, SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../utils/Constants"; 
import CustomText from "../utils/CustomText"; 

const Donation = () => {
  const payHereForm = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
          <input type="hidden" name="merchant_id" value="1211149">
          <input type="hidden" name="return_url" value="https://yourapp.com/return">
          <input type="hidden" name="cancel_url" value="https://yourapp.com/cancel">
          <input type="hidden" name="notify_url" value="https://yourapp.com/notify">

          <input type="hidden" name="order_id" value="VateLanka1234">
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
        <CustomText style={styles.heading}>Donation Page</CustomText>
      </View>
      <View style={styles.webViewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: payHereForm }}
          startInLoadingState
          renderLoading={() => <ActivityIndicator size="large" color={COLORS.primary} />}
        />
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
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
  },
  webViewContainer: {
    flex: 1,
    padding: 10,
  },
});

export default Donation;

import React from "react";
import { Text, StyleSheet } from "react-native";

const CustomText = ({ children, style, ...props }) => {
  return <Text style={[styles.defaultText, style]} {...props}>{children}</Text>;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Poppins_400Regular", // Replace with your custom font
    color: "#000", // Default text color
  },
});

export default CustomText;
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { loginWithEmail, sendPasswordReset } from "../services/firebaseAuth";
import NotificationBanner from "../utils/NotificationBanner";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";
import { saveUserSession } from "../utils/authStorage";

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type) => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      showNotification("Please enter both email and password.", "error");
      return;
    }
    try {
      const user = await loginWithEmail(email, password);

      if (user && user.emailVerified) {
        await saveUserSession(user);
      }

      showNotification("Login successful!", "success");

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainApp" }],
        });
      }, 1500);
    } catch (error) {
      if (error.message.includes("Please verify your email")) {
        showNotification(error.message, "error");
      } else {
        showNotification("Invalid email or password.", "error");
      }
    }
  };

  const handleForgotPassword = () => {
    const { email } = formData;
    if (!email) {
      showNotification(
        "Please enter your email to reset your password.",
        "error"
      );
      return;
    }
    sendPasswordReset(email)
      .then(() => showNotification("Password reset email sent!", "success"))
      .catch((error) => showNotification(error.message, "error"));
  };

  return (
    <View style={styles.container}>
      <NotificationBanner
        {...notification}
        onHide={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />
      <Image
        source={require("../ApplicationAssets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.card}>
        <CustomText style={styles.title}>Login</CustomText>
        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(email) => setFormData((prev) => ({ ...prev, email }))}
          value={formData.email}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          secureTextEntry
          onChangeText={(password) =>
            setFormData((prev) => ({ ...prev, password }))
          }
          value={formData.password}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.9}
        >
          <CustomText style={styles.buttonText}>Login</CustomText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.9}>
          <CustomText style={styles.forgotPasswordText}>
            Forgot Password?
          </CustomText>
        </TouchableOpacity>

        <View style={styles.signupTextContainer}>
          <CustomText style={styles.signupText}>
            Don't have an account?{" "}
            <CustomText
              style={styles.signupLink}
              onPress={() => navigation.navigate("SignupScreen")}
            >
              Sign Up
            </CustomText>
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  logo: {
    width: 150,
    height: 60,
    alignSelf: "center",
    marginTop: 70,
    marginBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    color: COLORS.black,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordText: {
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  signupTextContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  signupText: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    textDecorationLine: "none",
  },
});

export default LoginScreen;

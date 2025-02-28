import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import { signUpWithEmail } from "../services/firebaseAuth";
import {
  saveUserData,
  fetchMunicipalCouncils,
} from "../services/firebaseFirestore";
import NotificationBanner from "../utils/NotificationBanner";
import CustomText from "../utils/CustomText";
import { COLORS } from "../utils/Constants";
import Icon from "react-native-vector-icons/MaterialIcons";

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    municipalCouncil: "",
    municipalCouncilName: "Select Municipal Council",
  });
  const [councils, setCouncils] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const TERMS_URL = "https://www.vatelanka.lk/terms-conditions";
  const PRIVACY_URL = "https://www.vatelanka.lk/privacy-policy";

  useEffect(() => {
    loadCouncils();
  }, []);

  const loadCouncils = async () => {
    try {
      const councilList = await fetchMunicipalCouncils();
      setCouncils(councilList);
    } catch (error) {
      showNotification("Failed to load municipal councils.", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ visible: true, message, type });
  };

  const handleSignUp = async () => {
    const { name, email, password, municipalCouncil } = formData;

    if (!name || !email || !password || !municipalCouncil) {
      showNotification("Please fill in all fields!", "error");
      return;
    }

    try {
      const user = await signUpWithEmail(email, password);
      await saveUserData(user.uid, { name, email, municipalCouncil });

      showNotification(
        "Account created! Please verify your email before logging in.",
        "success"
      );

      setTimeout(() => navigation.navigate("SignInSignUp"), 3000);
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const handleCouncilSelect = (council) => {
    setFormData((prev) => ({
      ...prev,
      municipalCouncil: council.id,
      municipalCouncilName: council.name,
    }));
    setShowDropdown(false);
  };

  const openURL = useCallback(async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      showNotification(`Cannot open URL: ${url}`, "error");
    }
  }, []);

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
        <CustomText style={styles.title}>Sign Up</CustomText>

        <TextInput
          placeholder="Name"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          onChangeText={(name) => setFormData((prev) => ({ ...prev, name }))}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          keyboardType="email-address"
          onChangeText={(email) => setFormData((prev) => ({ ...prev, email }))}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          secureTextEntry
          onChangeText={(password) =>
            setFormData((prev) => ({ ...prev, password }))
          }
        />

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.9}
        >
          <CustomText
            style={[
              styles.dropdownButtonText,
              formData.municipalCouncil
                ? styles.dropdownButtonTextSelected
                : null,
            ]}
          >
            {formData.municipalCouncilName}
          </CustomText>
          <Icon
            name="arrow-drop-down"
            size={24}
            color={COLORS.placeholderTextColor}
          />
        </TouchableOpacity>

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownModal}>
              <ScrollView>
                {councils.map((council) => (
                  <TouchableOpacity
                    key={council.id}
                    style={styles.dropdownItem}
                    onPress={() => handleCouncilSelect(council)}
                  >
                    <CustomText style={styles.dropdownItemText}>
                      {council.name}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.termsContainer}>
          <CustomText style={styles.termsText}>
            By clicking Sign Up, you acknowledge that you have read and agree to
            VateLanka's{" "}
            <CustomText
              style={styles.termsLink}
              onPress={() => openURL(TERMS_URL)}
            >
              Terms of Conditions
            </CustomText>{" "}
            and{" "}
            <CustomText
              style={styles.termsLink}
              onPress={() => openURL(PRIVACY_URL)}
            >
              Privacy Policy
            </CustomText>
            .
          </CustomText>
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={handleSignUp}
        >
          <CustomText style={styles.buttonText}>Sign Up</CustomText>
        </TouchableOpacity>

        <View style={styles.loginTextContainer}>
          <CustomText style={styles.loginText}>
            Already have an account?{" "}
            <CustomText
              style={styles.loginLink}
              onPress={() => navigation.navigate("LoginScreen")}
            >
              Log in
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
    marginBottom: 50,
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
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  dropdownButtonText: {
    color: COLORS.placeholderTextColor,
    fontSize: 14,
  },
  dropdownButtonTextSelected: {
    color: COLORS.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    maxHeight: 300,
    padding: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.black,
  },
  termsContainer: {
    marginBottom: 15,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "500",
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
  loginTextContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  loginText: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    textDecorationLine: "none",
  },
});

export default SignupScreen;

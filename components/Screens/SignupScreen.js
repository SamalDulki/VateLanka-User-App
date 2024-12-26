import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { signUpWithEmail } from "../services/firebaseAuth";
import CustomText from "../utils/CustomText";
import { COLORS } from "../utils/Constants";
import {
  saveUserData,
  fetchMunicipalCouncils,
} from "../services/firebaseFirestore";
import Icon from "react-native-vector-icons/MaterialIcons";

const NotificationBanner = ({ message, type, visible, onHide }) => {
  const translateY = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  const backgroundColor =
    type === "success" ? COLORS.successbanner : COLORS.errorbanner;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.notificationBanner,
        { transform: [{ translateY }], backgroundColor },
      ]}
    >
      <CustomText style={styles.notificationText}>{message}</CustomText>
    </Animated.View>
  );
};

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [municipalCouncil, setMunicipalCouncil] = useState("");
  const [municipalCouncilName, setMunicipalCouncilName] = useState(
    "Select Municipal Council"
  );
  const [councils, setCouncils] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadCouncils = async () => {
      try {
        const councilList = await fetchMunicipalCouncils();
        setCouncils(councilList);
      } catch (error) {
        showNotification("Failed to load municipal councils.", "error");
      }
    };
    loadCouncils();
  }, []);

  const showNotification = (message, type) => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  const handleSignUp = async () => {
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

      setTimeout(() => {
        navigation.navigate("SignInSignUp");
      }, 3000);
    } catch (error) {
      showNotification(error.message, "error");
    }
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
        <CustomText style={styles.title}>Sign Up</CustomText>
        <TextInput
          placeholder="Name"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor={COLORS.placeholderTextColor}
          secureTextEntry
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.9}
        >
          <CustomText
            style={[
              styles.dropdownButtonText,
              municipalCouncil ? styles.dropdownButtonTextSelected : null,
            ]}
          >
            {municipalCouncilName}
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
                    onPress={() => {
                      setMunicipalCouncil(council.id);
                      setMunicipalCouncilName(council.name);
                      setShowDropdown(false);
                    }}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  notificationBanner: {
    position: "absolute",
    top: 50,
    right: 20,
    left: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
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
    fontWeight: 500,
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

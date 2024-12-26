import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";
import greetings from "../utils/greetings";
import Icon from "react-native-vector-icons/Feather";
import { auth, firestore } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Svg, { Circle, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NewsFeed } from "../api/NewsFeed";

const ProfileIcon = () => (
  <Svg width="40" height="40" viewBox="0 0 40 40">
    <Circle
      cx="20"
      cy="20"
      r="19"
      fill={COLORS.white}
      stroke={COLORS.primary}
      strokeWidth="2"
    />
    <Circle cx="20" cy="16" r="6" fill={COLORS.primary} />
    <Path
      d="M8 35.5C8 35.5 11 27 20 27C29 27 32 35.5 32 35.5"
      stroke={COLORS.primary}
      strokeWidth="2"
      fill={COLORS.white}
    />
  </Svg>
);

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [subGreeting, setSubGreeting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [newsKey, setNewsKey] = useState(0);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
      }
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const fetchSubGreeting = async () => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const newGreeting = greetings[randomIndex];
    setSubGreeting(newGreeting);
    await AsyncStorage.setItem("subGreeting", newGreeting);
    await AsyncStorage.setItem(
      "subGreetingTimestamp",
      new Date().getTime().toString()
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchSubGreeting()]);
    setGreeting(updateGreeting());
    setNewsKey((prev) => prev + 1);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData();
    setGreeting(updateGreeting());
    fetchSubGreeting();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={20} color={COLORS.gpslogo} />
            <CustomText style={styles.locationText}>
              GP Square, Bambalapitiya
            </CustomText>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <ProfileIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <CustomText style={styles.greetingText}>
            {greeting}, {userName}!
          </CustomText>
          <CustomText style={styles.subGreetingText}>{subGreeting}</CustomText>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.placeholderTextColor} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search For Updates"
            placeholderTextColor={COLORS.placeholderTextColor}
          />
        </View>

        <View style={styles.contentContainer}>
          <NewsFeed key={newsKey} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.textGray,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.black,
  },
  subGreetingText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.black,
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
});

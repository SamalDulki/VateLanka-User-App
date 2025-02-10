import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";
import greetings from "../utils/greetings";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth, firestore } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NewsFeed } from "../api/NewsFeed";
import { useFocusEffect } from "@react-navigation/native";
import { fetchUserSchedules } from "../services/firebaseFirestore";

const WasteTypeIcons = {
  Degradable: "delete-outline",
  Recyclable: "replay",
  "Non Recyclable": "delete-forever",
};

const WasteTypeColors = {
  Degradable: COLORS.DEGRADABLE_WASTE,
  Recyclable: COLORS.RECYCLABLE_WASTE,
  "Non Recyclable": COLORS.NON_RECYCLABLE_WASTE,
};

const ProfileButton = ({ onPress, style }) => (
  <TouchableOpacity
    style={[styles.profileButton, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.profileIconContainer}>
      <Icon name="person" size={24} color={COLORS.primary} />
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [subGreeting, setSubGreeting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [newsKey, setNewsKey] = useState(0);
  const [locationText, setLocationText] = useState("Select Location");
  const [todayCollections, setTodayCollections] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const scrollViewRef = useRef(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name);

          if (userData.wardName && userData.districtName) {
            const locationString = `${userData.wardName}, ${userData.districtName}`;
            setLocationText(locationString);
            await AsyncStorage.setItem("userLocation", locationString);
          } else {
            setLocationText("Select Location");
            await AsyncStorage.removeItem("userLocation");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const scheduleData = await fetchUserSchedules(user.uid);
        const today = new Date();
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const todayName = days[today.getDay()];

        const todaySchedules = scheduleData.filter(
          (schedule) => schedule.day === todayName || schedule.day === "All"
        );
        setTodayCollections(todaySchedules);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
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
    await Promise.all([
      fetchUserData(),
      fetchSubGreeting(),
      fetchTodaySchedule(),
    ]);
    setGreeting(updateGreeting());
    setNewsKey((prev) => prev + 1);
    setRefreshing(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.spring(searchAnimation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.spring(searchAnimation, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      setGreeting(updateGreeting());
      fetchSubGreeting();
      fetchTodaySchedule();
    }, [])
  );

  useEffect(() => {
    fetchUserData();
    setGreeting(updateGreeting());
    fetchSubGreeting();
    fetchTodaySchedule();
  }, []);

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          transform: [
            {
              translateY: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -200],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon name="location-on" size={20} color={COLORS.primary} />
          <CustomText style={styles.locationText}>{locationText}</CustomText>
          <Icon name="arrow-drop-down" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <ProfileButton onPress={() => navigation.navigate("Profile")} />
      </View>

      <View style={styles.greetingContainer}>
        <CustomText style={styles.greetingText}>
          {greeting}, {userName}!
        </CustomText>
        <CustomText style={styles.subGreetingText}>{subGreeting}</CustomText>
      </View>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          transform: [
            {
              translateY: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10],
              }),
            },
          ],
          zIndex: searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2],
          }),
        },
      ]}
    >
      <Icon name="search" size={24} color={COLORS.textGray} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search for updates"
        placeholderTextColor={COLORS.textGray}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    </Animated.View>
  );

  const renderScheduleCard = (collection, index) => (
    <View
      key={index}
      style={[
        styles.scheduleCard,
        { backgroundColor: WasteTypeColors[collection.wasteType] },
      ]}
    >
      <View style={styles.scheduleCardHeader}>
        <Icon
          name={WasteTypeIcons[collection.wasteType]}
          size={24}
          color={COLORS.white}
        />
        <CustomText style={styles.wasteTypeText}>
          {collection.wasteType}
        </CustomText>
      </View>

      {collection.timeSlot && (
        <View style={styles.scheduleTimeContainer}>
          <Icon name="access-time" size={16} color={COLORS.white} />
          <CustomText style={styles.timeText}>
            {`${collection.timeSlot.start} - ${collection.timeSlot.end}`}
          </CustomText>
        </View>
      )}

      {collection.frequency && (
        <View style={styles.frequencyContainer}>
          <Icon name="replay" size={14} color={COLORS.white} />
          <CustomText style={styles.frequencyText}>
            {collection.frequency}
          </CustomText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {todayCollections.length > 0 && (
          <View style={styles.scheduleSection}>
            <View style={styles.sectionHeader}>
              <Icon name="event" size={24} color={COLORS.primary} />
              <CustomText style={styles.sectionTitle}>
                Today's Collection
              </CustomText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scheduleScrollContent}
            >
              {todayCollections.map((collection, index) =>
                renderScheduleCard(collection, index)
              )}
            </ScrollView>
          </View>
        )}

        <View style={styles.newsFeedSection}>
          <View style={styles.sectionHeader}>
            <Icon name="article" size={24} color={COLORS.primary} />
            <CustomText style={styles.sectionTitle}>CMC News</CustomText>
          </View>
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
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginHorizontal: 8,
    fontWeight: "500",
  },
  profileButton: {
    padding: 8,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  greetingContainer: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  subGreetingText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scheduleSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 10,
  },
  scheduleScrollContent: {
    paddingRight: 20,
    paddingVertical: 5,
  },
  scheduleCard: {
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    width: 300,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  scheduleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  wasteTypeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 8,
    borderRadius: 8,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  frequencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  frequencyText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },
  newsFeedSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  newsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
  },
  newsDate: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  newsContent: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  refreshControl: {
    backgroundColor: "transparent",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

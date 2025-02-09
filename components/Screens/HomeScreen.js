import React, { useState, useEffect, useRef } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { fetchUserSchedules } from "../services/firebaseFirestore";

const WasteTypeColors = {
  Degradable: COLORS.DEGRADABLE_WASTE,
  Recyclable: COLORS.RECYCLABLE_WASTE,
  "Non Recyclable": COLORS.NON_RECYCLABLE_WASTE,
};

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
  const [locationText, setLocationText] = useState("Select Location");
  const [todayCollections, setTodayCollections] = useState([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const scrollViewRef = useRef(null);
  const headerRef = useRef(null);

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
      } else {
        setUserName("");
        setLocationText("Select Location");
        await AsyncStorage.removeItem("userLocation");
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
    setScrollEnabled(false);
    setIsSearchFocused(true);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: headerHeight, animated: true });
    }
  };

  const handleSearchBlur = () => {
    setScrollEnabled(true);
    setIsSearchFocused(false);
  };

  // Update data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      setGreeting(updateGreeting());
      fetchSubGreeting();
      fetchTodaySchedule();
    }, [])
  );

  // Initial data load
  useEffect(() => {
    fetchUserData();
    setGreeting(updateGreeting());
    fetchSubGreeting();
    fetchTodaySchedule();
  }, []);

  const SearchBar = () => (
    <View
      style={[
        styles.searchContainer,
        isSearchFocused && styles.searchContainerFocused,
      ]}
    >
      <Icon name="search" size={20} color={COLORS.placeholderTextColor} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search For Updates"
        placeholderTextColor={COLORS.placeholderTextColor}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header content */}
      <View
        ref={headerRef}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
        style={[
          styles.headerContent,
          isSearchFocused && styles.headerContentHidden,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={20} color={COLORS.gpslogo} />
            <CustomText style={styles.locationText}>{locationText}</CustomText>
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
      </View>

      {/* Search bar */}
      <SearchBar />

      {/* Scrollable content */}
      <ScrollView
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
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
        {/* News Feed Section */}
        <View style={styles.contentContainer}>
          <NewsFeed key={newsKey} />
        </View>

        {/* Today's Collection Section */}
        {todayCollections.length > 0 && (
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleHeader}>
              <Icon name="clock" size={20} color={COLORS.primary} />
              <CustomText style={styles.scheduleHeaderText}>
                Today's Collection
              </CustomText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scheduleScrollContent}
            >
              {todayCollections.map((collection, index) => (
                <View
                  key={index}
                  style={[
                    styles.scheduleCard,
                    { backgroundColor: WasteTypeColors[collection.wasteType] },
                  ]}
                >
                  <Icon
                    name={
                      collection.wasteType === "Degradable"
                        ? "trash"
                        : collection.wasteType === "Recyclable"
                        ? "refresh-cw"
                        : "trash-2"
                    }
                    size={20}
                    color={COLORS.white}
                  />
                  <CustomText style={styles.wasteTypeText}>
                    {collection.wasteType}
                  </CustomText>
                  {collection.timeSlot && (
                    <CustomText style={styles.timeText}>
                      {`${collection.timeSlot.start} - ${collection.timeSlot.end}`}
                    </CustomText>
                  )}
                  {collection.frequency && (
                    <CustomText style={styles.frequencyText}>
                      {collection.frequency}
                    </CustomText>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContent: {
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
  headerContentHidden: {
    height: 0,
    overflow: "hidden",
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
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    zIndex: 2,
  },
  searchContainerFocused: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.black,
  },
  scheduleContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 8,
  },
  scheduleScrollContent: {
    paddingRight: 20,
  },
  scheduleCard: {
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 330,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wasteTypeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  frequencyText: {
    color: COLORS.white,
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
});

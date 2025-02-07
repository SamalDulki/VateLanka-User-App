import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { COLORS } from "../utils/Constants";
import CustomText from "../utils/CustomText";
import { auth } from "../utils/firebaseConfig";
import { fetchUserSchedules } from "../services/firebaseFirestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";

const WasteTypeColors = {
  Degradable: COLORS.primary,
  Recyclable: COLORS.successbanner,
  "Non Recyclable": COLORS.errorbanner,
};

const WasteTypeIcons = {
  Degradable: "delete",
  Recyclable: "recycling",
  "Non Recyclable": "delete-forever",
};

export function ScheduleScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadSchedules();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("Please sign in to view schedules");
      }

      const scheduleData = await fetchUserSchedules(user.uid);
      const next7DaysSchedule = generateNext7DaysSchedule(scheduleData);
      setSchedules(next7DaysSchedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNext7DaysSchedule = (scheduleData) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const next7Days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = days[date.getDay()];
      const dateString = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Find collections for this day
      const collections = scheduleData.filter(
        (schedule) => schedule.day === dayName || schedule.day === "All"
      );

      next7Days.push({
        date: dateString,
        dayName,
        dayLabel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayName,
        collections,
      });
    }

    return next7Days;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Icon name="error-outline" size={48} color={COLORS.errorbanner} />
          <CustomText style={styles.errorText}>{error}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
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
          <CustomText style={styles.heading}>Collection Schedule</CustomText>
          <CustomText style={styles.subHeading}>Next 7 Days</CustomText>
        </View>

        {schedules.map((daySchedule) => (
          <View key={daySchedule.date} style={styles.scheduleCard}>
            <View style={styles.dateHeader}>
              <CustomText style={styles.dayLabel}>
                {daySchedule.dayLabel}
              </CustomText>
              <CustomText style={styles.dateText}>
                {daySchedule.date}
              </CustomText>
            </View>

            <View style={styles.collectionsContainer}>
              {daySchedule.collections.length > 0 ? (
                daySchedule.collections.map((collection, index) => (
                  <View
                    key={`${collection.wasteType}_${index}`}
                    style={[
                      styles.collectionItem,
                      {
                        backgroundColor: WasteTypeColors[collection.wasteType],
                      },
                    ]}
                  >
                    <Icon
                      name={WasteTypeIcons[collection.wasteType]}
                      size={20}
                      color={COLORS.white}
                    />
                    <CustomText style={styles.collectionText}>
                      {collection.wasteType}
                    </CustomText>
                    <CustomText style={styles.frequencyText}>
                      {collection.frequency}
                    </CustomText>
                  </View>
                ))
              ) : (
                <View style={styles.noCollectionContainer}>
                  <Icon name="event-busy" size={24} color={COLORS.textGray} />
                  <CustomText style={styles.noCollectionText}>
                    No collections scheduled
                  </CustomText>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.errorbanner,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 5,
  },
  subHeading: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  scheduleCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  collectionsContainer: {
    gap: 10,
  },
  collectionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  collectionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
  },
  frequencyText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  noCollectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noCollectionText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textGray,
  },
});

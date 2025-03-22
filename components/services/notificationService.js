import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { fetchUserSchedules } from "./firebaseFirestore";
import { auth } from "../utils/firebaseConfig";
const BACKGROUND_COLLECTION_CHECK = "background-collection-check";
const BACKGROUND_TRUCK_CHECK = "background-truck-check";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializeNotifications = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("collection-reminders", {
      name: "Collection Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#34A853",
    });

    await Notifications.setNotificationChannelAsync("truck-alerts", {
      name: "Truck Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1976D2",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  return true;
};

export const registerBackgroundTasks = async () => {
  TaskManager.defineTask(BACKGROUND_COLLECTION_CHECK, async () => {
    const notificationsEnabled = await isNotificationsEnabled();
    if (!notificationsEnabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const user = auth.currentUser;
    if (!user) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    try {
      await scheduleMorningReminders(user.uid);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("Background task error:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  await BackgroundFetch.registerTaskAsync(BACKGROUND_COLLECTION_CHECK, {
    minimumInterval: 60 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
};

export const isNotificationsEnabled = async () => {
  try {
    const notificationsEnabled = await AsyncStorage.getItem(
      "notificationsEnabled"
    );
    return notificationsEnabled === "true";
  } catch (error) {
    console.error("Error checking notification status:", error);
    return false;
  }
};

export const setNotificationsEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(
      "notificationsEnabled",
      enabled ? "true" : "false"
    );

    if (enabled) {
      await registerBackgroundTasks();
    } else {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_COLLECTION_CHECK);
    }

    return true;
  } catch (error) {
    console.error("Error setting notification status:", error);
    return false;
  }
};

export const scheduleMorningReminders = async (userId) => {
  try {
    const schedules = await fetchUserSchedules(userId);
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

    const todayCollections = schedules.filter(
      (schedule) => schedule.day === todayName || schedule.day === "All"
    );

    if (todayCollections.length === 0) {
      return;
    }

    const morningReminder = new Date();
    morningReminder.setHours(6, 0, 0, 0);
    if (today.getHours() >= 6) {
      return;
    }

    const wasteTypes = todayCollections
      .map((collection) => collection.wasteType)
      .join(", ");

    let earliestTime = "23:59";
    let latestTime = "00:00";

    todayCollections.forEach((collection) => {
      if (collection.timeSlot) {
        if (collection.timeSlot.start < earliestTime) {
          earliestTime = collection.timeSlot.start;
        }
        if (collection.timeSlot.end > latestTime) {
          latestTime = collection.timeSlot.end;
        }
      }
    });

    const timeRangeText =
      earliestTime !== "23:59"
        ? `between ${earliestTime} - ${latestTime}`
        : "today";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Waste Collection Today",
        body: `Get ready for ${wasteTypes} collection ${timeRangeText}. Please keep your waste sorted and ready for pickup.`,
        data: { type: "morning-reminder" },
      },
      trigger: {
        date: morningReminder,
      },
    });

    await storeCollectionTimes(todayCollections);
  } catch (error) {
    console.error("Error scheduling morning reminders:", error);
  }
};

const storeCollectionTimes = async (todayCollections) => {
  try {
    const collectionTimes = todayCollections
      .filter((collection) => collection.timeSlot)
      .map((collection) => ({
        wasteType: collection.wasteType,
        start: collection.timeSlot.start,
        end: collection.timeSlot.end,
      }));

    await AsyncStorage.setItem(
      "todayCollectionTimes",
      JSON.stringify(collectionTimes)
    );
  } catch (error) {
    console.error("Error storing collection times:", error);
  }
};

export const isWithinCollectionHours = async () => {
  try {
    const collectionTimesStr = await AsyncStorage.getItem(
      "todayCollectionTimes"
    );
    if (!collectionTimesStr) return false;

    const collectionTimes = JSON.parse(collectionTimesStr);
    if (collectionTimes.length === 0) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return collectionTimes.some(
      (timeSlot) => currentTime >= timeSlot.start && currentTime <= timeSlot.end
    );
  } catch (error) {
    console.error("Error checking collection hours:", error);
    return false;
  }
};

export const sendTruckProximityNotification = async (truck) => {
  const notificationsEnabled = await isNotificationsEnabled();
  if (!notificationsEnabled) return false;

  const isCollectionTime = await isWithinCollectionHours();
  if (!isCollectionTime) return false;

  const lastNotificationTime = await AsyncStorage.getItem(
    `last_truck_notification_${truck.id}`
  );
  if (lastNotificationTime) {
    const timeSinceLastNotification =
      Date.now() - parseInt(lastNotificationTime);
    if (timeSinceLastNotification < 30 * 60 * 1000) {
      return false;
    }
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Garbage Truck Nearby!",
        body: `A collection truck (${
          truck.numberPlate || "Unknown"
        }) is now within ${
          truck.distance
        }m of your location. Please check if your waste is ready for collection.`,
        data: { type: "truck-proximity", truckId: truck.id },
      },
      trigger: null,
    });

    await AsyncStorage.setItem(
      `last_truck_notification_${truck.id}`,
      Date.now().toString()
    );
    return true;
  } catch (error) {
    console.error("Error sending truck proximity notification:", error);
    return false;
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

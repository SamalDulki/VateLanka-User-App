import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../utils/firebaseConfig";

const NOTIFICATION_ENABLED_KEY = "notificationsEnabled";
const EXPO_PUSH_TOKEN_KEY = "expoPushToken";
const LAST_NOTIFICATION_DATE_KEY = "lastNotificationDate";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("waste-collection", {
      name: "Waste Collection Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00B386",
      sound: true,
    });
  }

  return token?.data;
}

export async function saveNotificationPreferences(enabled) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is signed in");
      return false;
    }

    await AsyncStorage.setItem(
      NOTIFICATION_ENABLED_KEY,
      JSON.stringify(enabled)
    );

    let token = null;
    if (enabled) {
      const storedToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);

      if (!storedToken) {
        token = await registerForPushNotificationsAsync();
        if (token) {
          await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
        }
      } else {
        token = storedToken;
      }
    }

    const userRef = doc(firestore, "users", user.uid);
    await updateDoc(userRef, {
      notificationsEnabled: enabled,
      expoPushToken: token,
      notificationUpdatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    return false;
  }
}

export async function getNotificationPreferences() {
  try {
    const storedPreferences = await AsyncStorage.getItem(
      NOTIFICATION_ENABLED_KEY
    );

    if (storedPreferences !== null) {
      return JSON.parse(storedPreferences);
    }

    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists() && userDoc.data().notificationsEnabled !== undefined) {
      const enabled = userDoc.data().notificationsEnabled;
      await AsyncStorage.setItem(
        NOTIFICATION_ENABLED_KEY,
        JSON.stringify(enabled)
      );
      return enabled;
    }

    return false;
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return false;
  }
}

export async function clearNotificationPreferencesOnLocationChange() {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));

    const userRef = doc(firestore, "users", user.uid);
    await updateDoc(userRef, {
      notificationsEnabled: false,
      notificationUpdatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error clearing notification preferences:", error);
    return false;
  }
}

export async function scheduleCollectionNotification(collection, date) {
  if (!collection.timeSlot) return null;

  try {
    const [hours, minutes] = collection.timeSlot.start.split(":").map(Number);

    const notificationDate = new Date(date);
    notificationDate.setHours(hours - 1, minutes, 0);

    const now = new Date();
    
    if (notificationDate <= now || 
        (notificationDate - now) < 5 * 60 * 1000) {
      console.log(`Skipping notification for ${collection.wasteType} at ${notificationDate} (too soon)`);
      return null;
    }

    const notificationId = `${collection.wasteType}-${date.toDateString()}-${
      collection.timeSlot.start
    }`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${collection.wasteType} Waste Collection Soon`,
        body: `Your ${collection.wasteType.toLowerCase()} waste will be collected between ${
          collection.timeSlot.start
        } - ${collection.timeSlot.end} today.`,
        data: { collection, date: date.toISOString() },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationDate,
        channelId: "waste-collection",
      },
      identifier: notificationId,
    });
    
    console.log(`Scheduled notification for ${collection.wasteType} at ${notificationDate.toLocaleTimeString()}`);
    return id;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

export async function scheduleAllCollectionNotifications(schedules) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  
    const notificationsEnabled = await getNotificationPreferences();
    if (!notificationsEnabled) return [];
  
    const scheduledIds = [];
  
    if (schedules.length > 0) {
      const todaySchedule = schedules[0];
      const date = new Date();
      
      console.log(`Scheduling notifications for ${todaySchedule.dayLabel} (${todaySchedule.date})`);
      
      for (const collection of todaySchedule.collections) {
        const id = await scheduleCollectionNotification(collection, date);
        if (id) {
          scheduledIds.push(id);
        }
      }
    }
    
    console.log(`Scheduled ${scheduledIds.length} notifications for today's collections`);
    return scheduledIds;
  }

export async function initializeNotifications() {
  try {
    const notificationsEnabled = await getNotificationPreferences();
    if (notificationsEnabled) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);

        const user = auth.currentUser;
        if (user) {
          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
            expoPushToken: token,
            notificationUpdatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return notificationsEnabled;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
}

export async function checkAndRefreshDailyNotifications(schedules) {
    try {
      const lastDateStr = await AsyncStorage.getItem(LAST_NOTIFICATION_DATE_KEY);
      const today = new Date();
      const todayDateStr = today.toDateString();
  
      if (!lastDateStr || lastDateStr !== todayDateStr) {
        console.log("New day detected, refreshing notifications");
        
        await scheduleAllCollectionNotifications(schedules);
        
        await AsyncStorage.setItem(LAST_NOTIFICATION_DATE_KEY, todayDateStr);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for new day:", error);
      return false;
    }
  }
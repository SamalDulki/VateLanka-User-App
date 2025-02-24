import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveUserSession = async (user) => {
  try {
    if (!user) return;

    const userData = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    };
    await AsyncStorage.setItem("userSession", JSON.stringify(userData));
    console.log("User session saved successfully");
  } catch (error) {
    console.error("Error saving user session:", error);
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem("userSession");
    console.log("User session cleared successfully");
  } catch (error) {
    console.error("Error clearing user session:", error);
  }
};

export const getUserSession = async () => {
  try {
    const userSession = await AsyncStorage.getItem("userSession");
    return userSession ? JSON.parse(userSession) : null;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
};

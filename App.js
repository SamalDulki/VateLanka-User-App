import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WelcomeScreen from "./components/Screens/WelcomeScreen";
import SignInSignUpScreen from "./components/Screens/SignInSignUpScreen";
import SignupScreen from "./components/Screens/SignupScreen";
import LoginScreen from "./components/Screens/LoginScreen";
import HomeScreen from "./components/Screens/HomeScreen";
import ProfileScreen from "./components/Screens/ProfileScreen";
import { ScheduleScreen } from "./components/Screens/ScheduleScreen";
import { ReportScreen } from "./components/Screens/ReportScreen";
import { TrackScreen } from "./components/Screens/TrackScreen";
import { RecycleScreen } from "./components/Screens/RecycleScreen";
import { getFirebaseAuth } from "./components/utils/firebaseConfig";
import Icon from "react-native-vector-icons/Feather";
import { COLORS } from "./components/utils/Constants";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.iconinactive,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="navigation" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={TrackScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map-pin" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recycle"
        component={RecycleScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="refresh-cw" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [auth, setAuth] = React.useState(null);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const firebaseAuth = await getFirebaseAuth();
        setAuth(firebaseAuth);
      } catch (error) {
        console.error("Failed to initialize Firebase Auth:", error);
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  React.useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.emailVerified) {
        auth.signOut();
        setUser(null);
      } else if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [auth, initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainApp" component={HomeTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignInSignUp" component={SignInSignUpScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
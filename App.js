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
import { auth } from "./components/utils/firebaseConfig";
import Icon from "react-native-vector-icons/Feather";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: "white",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="navigation" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map-pin" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recycle"
        component={HomeScreen}
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

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !user.emailVerified) {
        // If user is not verified, sign them out and keep them in auth flow
        auth.signOut();
        setUser(null);
      } else if (user && user.emailVerified) {
        // Only set authenticated user if email is verified
        setUser(user);
      } else {
        setUser(null);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

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
          // Only show these screens if user is verified and logged in
          <>
            <Stack.Screen name="MainApp" component={HomeTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          // Show these screens for unverified/logged out users
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

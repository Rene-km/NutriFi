import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, usePathname } from 'expo-router';

import { Platform, View, Image, StyleSheet } from "react-native";

export default function TabLayout() {
  const isWeb = Platform.OS === "web";
  const pathname = usePathname();
  const hideTabBar = pathname.includes("workout/session/");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#0f766e",
        tabBarInactiveTintColor: "#64748b",

        tabBarPosition: isWeb ? "left" : "bottom",

        tabBarStyle: hideTabBar
        ? { display: "none" }
        : isWeb
          ? {
              width: 250,
              height: "100%",
              backgroundColor: "#ffffff",
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
              borderTopWidth: 0,

              // room for the large bottom logo
              paddingTop: 24,
              paddingBottom: 210,
              paddingHorizontal: 0,
            }
          : {
              backgroundColor: "#ffffff",
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
            },

        tabBarItemStyle: isWeb
          ? {
              height: 48,
              borderRadius: 12,
              marginBottom: 8,
              marginHorizontal: 12,
              paddingHorizontal: 12,
              justifyContent: "center",
            }
          : undefined,

        tabBarLabelPosition: isWeb ? "beside-icon" : "below-icon",

        tabBarLabelStyle: isWeb
          ? {
              fontSize: 14,
              fontWeight: "600",
              marginLeft: 8,
            }
          : {
              fontSize: 11,
              fontWeight: "500",
            },

        tabBarActiveBackgroundColor: isWeb
          ? "rgba(16, 185, 129, 0.14)"
          : "transparent",

        tabBarBackground: isWeb
          ? () => (
              <View pointerEvents="none" style={styles.sidebarBackground}>
                <View style={styles.logoBottomContainer}>
                  <Image
                    source={require("@/assets/images/NF_blue.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )
          : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarButtonTestID: "tab-workout",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="recipe"
        options={{
          title: "Recipe",
          tabBarButtonTestID: "tab-recipe",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebarBackground: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  logoBottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  logoImage: {
    width: 150,
    height: 150,
  },
});
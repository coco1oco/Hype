import { Tabs } from "expo-router";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF", // system-blue
        tabBarInactiveTintColor: "#8E8E93", // gray-1
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 36,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0, // remove shadow on Android to handle it manually
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        // This gives the tab bar the Glass effect
        tabBarBackground: () => (
          <View style={{ borderRadius: 36, overflow: "hidden", flex: 1 }}>
            <BlurView
              intensity={80}
              tint="light"
              style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.8)" }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scan",
          // Special styling for the Scan button to make it pop
          tabBarIconStyle: {
            marginBottom: 4,
          },
          tabBarIcon: ({ color }) => (
            <View className="bg-system-blue/10 p-2 rounded-full">
              <Ionicons name="scan" size={24} color="#007AFF" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

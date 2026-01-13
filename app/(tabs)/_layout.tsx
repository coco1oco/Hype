// app/(tabs)/_layout.tsx
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Calendar, Heart, Ticket } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "../../components/haptic-tab";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#0B0F1A",
        tabBarInactiveTintColor: "rgba(17,24,39,0.72)",
        tabBarItemStyle: {
          paddingTop: Platform.OS === "ios" ? 10 : 8,
          paddingBottom: Platform.OS === "ios" ? 10 : 8,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === "ios" ? 0 : 1,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          borderRadius: 32,
          backgroundColor: Platform.select({
            ios: "transparent",
            default: "rgba(255,255,255,0.97)",
          }),
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(17,24,39,0.10)",
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={18}
            tint="light"
            style={{ flex: 1, borderRadius: 32, overflow: "hidden" }}
          >
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.tabBarSolidOverlay]}
            />
          </BlurView>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -1,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="event/index"
        options={{
          title: "Events",
          tabBarLabel: "Events",
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size ?? 22} strokeWidth={2.25} />
          ),
        }}
      />

      {/* Hide detail screen from the tab bar (still routable). */}
      <Tabs.Screen
        name="event/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarLabel: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Heart color={color} size={size ?? 22} strokeWidth={2.25} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets/index"
        options={{
          title: "Tickets",
          tabBarLabel: "Tickets",
          tabBarIcon: ({ color, size }) => (
            <Ticket color={color} size={size ?? 22} strokeWidth={2.25} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarSolidOverlay: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
});

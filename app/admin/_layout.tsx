// app/admin/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hide header for all admin screens
      }}
    >
      <Stack.Screen name="index" />
      {/* Add more admin screens here later */}
    </Stack>
  );
}


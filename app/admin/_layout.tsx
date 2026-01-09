// app/admin/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Admin Dashboard" }}
      />
      {/* Add more admin screens here later */}
    </Stack>
  );
}

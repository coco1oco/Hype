// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Seamless transition (no slide)
        animation: "fade",
        gestureEnabled: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="login" options={{ animation: "fade" }} />
      <Stack.Screen name="admin-login" options={{ animation: "fade" }} />
    </Stack>
  );
}

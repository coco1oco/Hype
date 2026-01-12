// app/_layout.tsx
import { Stack } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";
import { Buffer } from "buffer";

export default function RootLayout() {
  // Make Buffer available globally for React Native
  if (!(global as any).Buffer) {
    (global as any).Buffer = Buffer;
  }

  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FavoritesProvider>
  );
}

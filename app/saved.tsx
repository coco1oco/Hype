// app/saved.tsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FavoritesContext } from "../context/FavoritesContext";

export default function SavedScreen() {
  const router = useRouter();
  const { saved } = React.useContext(FavoritesContext);

  if (saved.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text>No saved venues yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {saved.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
          onPress={() =>
            router.push({ pathname: "/event/[id]", params: { id: event.id } })
          }
        >
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>
            {event.title}
          </Text>
          <Text style={{ fontSize: 12, color: "#555" }}>
            {event.venue} · {event.city}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

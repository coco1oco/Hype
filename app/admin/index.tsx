// app/admin/index.tsx
import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AdminHome() {
  const router = useRouter();

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={{ padding: 24 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Admin Dashboard
        </Text>
        <Text style={{ color: "#e5e7eb", marginBottom: 24 }}>
          Admin-only tools will go here.
        </Text>
        <TouchableOpacity
          onPress={handleAdminLogout}
          style={{
            height: 40,
            borderRadius: 999,
            backgroundColor: "#EF4444",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            Log out (admin)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

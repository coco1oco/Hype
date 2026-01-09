// app/(auth)/admin-login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

const ADMIN_EMAIL = "admin@hype.test";


const handleAdminLogin = async () => {
  setErrorMsg(null);
  setLoading(true);

  if (!email || !password) {
    setErrorMsg("Enter admin email and password.");
    setLoading(false);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setErrorMsg("Invalid credentials.");
    setLoading(false);
    return;
  }

  const user = data.user;

  // lock down to the one admin account + role check
  if (user?.email !== ADMIN_EMAIL || user.user_metadata?.role !== "Admin") {
    setErrorMsg("You are not authorized as admin.");
    setLoading(false);
    await supabase.auth.signOut();
    return;
  }

  setLoading(false);
  router.replace("/admin" as any);
};
  

  

  return (
    <LinearGradient
      colors={["#020617", "#0b1220", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Admin Login
        </Text>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}>
            Email
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 9,
              marginBottom: 10,
              backgroundColor: "#ffffff",
            }}
          >
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ fontSize: 14, color: "#111827" }}
            />
          </View>

          <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}>
            Password
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 9,
              marginBottom: 10,
              backgroundColor: "#ffffff",
            }}
          >
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ fontSize: 14, color: "#111827" }}
            />
          </View>

          {errorMsg && (
            <Text
              style={{
                color: "#DC2626",
                fontSize: 12,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleAdminLogin}
            activeOpacity={0.9}
            style={{
              height: 44,
              borderRadius: 999,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
            disabled={loading}
          >
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              {loading ? "Signing in..." : "Sign In as Admin"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: "center" }}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            Back to user login
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

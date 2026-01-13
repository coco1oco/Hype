// app/(auth)/admin-login.tsx
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const backgroundSource = require("../../assets/hype2.jpg");
  const backgroundBlurRadius = Platform.select({
    ios: 28,
    android: 18,
    default: 24,
  });

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
    <View style={styles.screen}>
      <Image
        source={backgroundSource}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        blurRadius={backgroundBlurRadius}
      />
      <View style={styles.backdrop} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.brandHeader}>
            <Image
              source={require("../../assets/hype1.png")}
              style={styles.brandMark}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>HYPE</Text>
            <Text style={styles.brandSubtitle}>ADMIN — SIGN IN</Text>
          </View>

          <BlurView intensity={26} tint="light" style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>ADMIN ACCESS</Text>

              <Text style={styles.label}>EMAIL</Text>
              <BlurView intensity={18} tint="light" style={styles.glassField}>
                <View style={styles.fieldRow}>
                  <Mail size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="admin@hype.test"
                    placeholderTextColor={stylesVars.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </BlurView>

              <Text style={styles.label}>PASSWORD</Text>
              <BlurView intensity={18} tint="light" style={styles.glassField}>
                <View style={styles.fieldRow}>
                  <Lock size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Enter password"
                    placeholderTextColor={stylesVars.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.textInput}
                  />
                </View>
              </BlurView>

              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

              <TouchableOpacity
                onPress={handleAdminLogin}
                activeOpacity={0.9}
                style={[
                  styles.primaryButton,
                  loading ? { opacity: 0.7 } : null,
                ]}
                disabled={loading}
              >
                <View style={styles.primaryButtonRow}>
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Signing in..." : "Continue"}
                  </Text>
                  <ArrowRight size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: "center", marginTop: 10 }}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Text style={styles.backLink}>Back to user login</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const stylesVars = {
  placeholder: "rgba(17, 24, 39, 0.38)",
  icon: "rgba(17, 24, 39, 0.58)",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandMark: {
    width: 120,
    height: 120,
    marginBottom: 4,
    opacity: 0.95,
  },
  brandTitle: {
    fontSize: 44,
    letterSpacing: 1,
    color: "#0B0F1A",
    textTransform: "uppercase",
    fontFamily: "BebasNeue",
    lineHeight: 44,
  },
  brandSubtitle: {
    marginTop: 2,
    color: "rgba(17,24,39,0.55)",
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  cardInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  cardTitle: {
    fontSize: 18,
    letterSpacing: 1,
    color: "#0B0F1A",
    textTransform: "uppercase",
    fontFamily: "BebasNeue",
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    color: "rgba(17,24,39,0.55)",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  glassField: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "rgba(255,255,255,0.22)",
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0B0F1A",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: "#0B0F1A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  backLink: {
    color: "rgba(17,24,39,0.55)",
    fontSize: 12,
  },
});

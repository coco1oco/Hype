// app/(auth)/login.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

import { useRouter } from "expo-router";
import {
  ArrowRight,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const backgroundSource = require("../../assets/hype2.jpg");
  const backgroundBlurRadius = Platform.select({
    ios: 28,
    android: 18,
    default: 24,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<"role" | "form">("role");
  const [signUpRole, setSignUpRole] = useState<"Organizer" | "Buyer" | null>(
    null
  );

  // NEW: separate organizer modal flag already in your file
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const anyModalOpen = showSignUp || showOrganizerModal;
  // Buyer sign-up fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpAddress, setSignUpAddress] = useState("");

  const [signUpBirthday, setSignUpBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [signUpGender, setSignUpGender] = useState<
    "Male" | "Female" | "Other" | null
  >(null);
  const [showGenderMenu, setShowGenderMenu] = useState(false);

  // Organizer fields
  const [orgName, setOrgName] = useState("");
  const [orgEventDetails, setOrgEventDetails] = useState("");
  const [orgContact, setOrgContact] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgProofImages, setOrgProofImages] = useState<string[]>([]);
  const [orgPassword, setOrgPassword] = useState("");

  const pickProofImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!res.canceled) {
      const uris = res.assets.map((a) => a.uri);
      setOrgProofImages((prev) => [...prev, ...uris]);
    }
  };

  // BUYER SIGN UP
  const handleSignUp = async () => {
    setErrorMsg(null);
    setLoading(true);

    if (!signUpEmail || !signUpPassword) {
      setErrorMsg("Please enter email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: {
          full_name: signUpName,
          birthday: signUpBirthday
            ? signUpBirthday.toISOString().split("T")[0]
            : null,
          gender: signUpGender,
          address: signUpAddress,
          role: "Buyer",
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: signUpName,
        birthdate: signUpBirthday
          ? signUpBirthday.toISOString().split("T")[0]
          : null,
        email: signUpEmail,
        gender: signUpGender,
        address: signUpAddress,
        role: "Buyer",
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        setLoading(false);
        return;
      }
    }

    // close buyer form
    setShowSignUp(false);
    setSignUpStep("role");
    setLoading(false);
  };

  // ORGANIZER SIGN UP
  const handleOrganizerSignUp = async () => {
    console.log("Organizer sign up pressed");
    setErrorMsg(null);
    setLoading(true);

    if (!orgEmail || !orgPassword) {
      setErrorMsg("Please enter organizer email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: orgEmail,
      password: orgPassword,
      options: {
        data: {
          org_name: orgName,
          org_event_details: orgEventDetails,
          org_contact: orgContact,
          role: "Organizer",
        },
      },
    });

    console.log("org signUp data", data);
    console.log("org signUp error", error);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: orgName,
        email: orgEmail,
        role: "Organizer",
        org_name: orgName,
        org_event_details: orgEventDetails,
        org_contact: orgContact,
      });

      if (profileError) {
        setErrorMsg(profileError.message);
        setLoading(false);
        return;
      }
    }

    // success: clear fields and close modals
    setOrgName("");
    setOrgEventDetails("");
    setOrgContact("");
    setOrgEmail("");
    setOrgPassword("");
    setOrgProofImages([]);
    setErrorMsg(null);

    setShowOrganizerModal(false); // hide organizer modal
    setLoading(false);
  };

  // LOGIN — route buyer vs organizer, block admin
  const handleLogin = async () => {
    if (showSignUp || showOrganizerModal) return;

    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    // block admin on this screen
    const isAdminEmail = user?.email === "admin@hype.test";
    const isAdminRole = user?.user_metadata?.role === "Admin";
    if (isAdminEmail || isAdminRole) {
      setErrorMsg("Use the Admin sign in screen for this account.");
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }

    // role from auth metadata (set during sign up)
    const role = (user?.user_metadata as any)?.role ?? null;

    if (role === "Organizer") {
      router.replace("/organizer/organizerDashboard" as any);
    } else {
      router.replace("/event");
    }

    setLoading(false);
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
          {/* Brand header */}
          <View style={styles.brandHeader}>
            <Image
              source={require("../../assets/hype1.png")}
              style={styles.brandMark}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>HYPE</Text>
            <Text style={styles.brandSubtitle}>WELCOME BACK — SIGN IN</Text>
          </View>

          {/* LOGIN CARD – pointerEvents added so it cannot be touched under modal */}
          <BlurView
            intensity={26}
            tint="light"
            pointerEvents={anyModalOpen ? "none" : "auto"}
            style={styles.card}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>SIGN IN</Text>

              {/* Email */}
              <Text style={styles.label}>EMAIL</Text>
              <BlurView intensity={18} tint="light" style={styles.glassField}>
                <View style={styles.fieldRow}>
                  <Mail size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor={stylesVars.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </BlurView>

              {/* Password */}
              <Text style={styles.label}>PASSWORD</Text>
              <BlurView intensity={18} tint="light" style={styles.glassField}>
                <View style={styles.fieldRow}>
                  <Lock size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor={stylesVars.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.textInput}
                  />
                </View>
              </BlurView>

              <View style={styles.forgotRow}>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* ERROR: only show when no modal is open */}
              {errorMsg && !anyModalOpen && (
                <Text style={styles.errorText}>{errorMsg}</Text>
              )}

              {/* Primary button */}
              <TouchableOpacity
                onPress={handleLogin}
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

              {/* Footer: open role selection + admin */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{" "}
                  <Text
                    style={styles.footerLink}
                    onPress={() => {
                      setErrorMsg(null);
                      setSignUpRole(null);
                      setSignUpStep("role");
                      setShowSignUp(true);
                      setShowOrganizerModal(false);
                    }}
                  >
                    Sign Up
                  </Text>
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/admin-login" as any)}
                  activeOpacity={0.85}
                >
                  <BlurView
                    intensity={16}
                    tint="light"
                    style={styles.secondaryPill}
                  >
                    <Text style={styles.secondaryPillText}>Admin sign in</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ROLE + BUYER SIGN UP MODAL */}
      <Modal
        visible={showSignUp}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSignUp(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={18}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          {signUpStep === "role" ? (
            // STEP 1: ROLE SELECTION
            <View style={styles.modalCard}>
              <View style={styles.modalCardInner}>
                <Text
                  style={{
                    fontSize: 20,
                    letterSpacing: 1,
                    color: "#0B0F1A",
                    textTransform: "uppercase",
                    fontFamily: "BebasNeue",
                    marginBottom: 8,
                  }}
                >
                  How are you using Hype?
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 12,
                  }}
                >
                  Choose your role to continue.
                </Text>

                {[
                  {
                    key: "Organizer" as const,
                    title: "Organizer",
                    description: "Create events and list tickets.",
                  },
                  {
                    key: "Buyer" as const,
                    title: "Buyer",
                    description: "Browse events and buy tickets.",
                  },
                ].map((option) => {
                  const selected = signUpRole === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      activeOpacity={0.9}
                      onPress={() => setSignUpRole(option.key)}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: selected ? "#2563EB" : "#E5E7EB",
                        backgroundColor: selected ? "#DBEAFE" : "#ffffff",
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: selected ? "#1D4ED8" : "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {option.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                        }}
                      >
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* FIXED: Sign Up in role step only changes modals */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: signUpRole
                      ? "#0B0F1A"
                      : "rgba(11,15,26,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                  disabled={!signUpRole}
                  onPress={() => {
                    if (signUpRole === "Buyer") {
                      setSignUpStep("form"); // open buyer form in this modal
                    } else if (signUpRole === "Organizer") {
                      setShowSignUp(false);
                      setShowOrganizerModal(true); // open organizer modal
                    }
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowSignUp(false);
                    setSignUpStep("role");
                    setSignUpRole(null);
                  }}
                  style={{ alignItems: "center", paddingVertical: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // STEP 2: BUYER FORM (unchanged except final onPress uses handleSignUp)
            <View style={styles.modalCard}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text
                  style={{
                    fontSize: 20,
                    letterSpacing: 1,
                    color: "#0B0F1A",
                    textTransform: "uppercase",
                    fontFamily: "BebasNeue",
                    marginBottom: 4,
                  }}
                >
                  Create your Hype account
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 12,
                  }}
                >
                  Signing up as {signUpRole ?? "User"}.
                </Text>

                {/* Name */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Full Name
                </Text>
                <View style={styles.inputBar}>
                  <View style={styles.fieldRow}>
                    <User size={18} color={stylesVars.icon} />
                    <TextInput
                      placeholder="Enter your name"
                      placeholderTextColor={stylesVars.placeholder}
                      style={styles.textInput}
                      value={signUpName}
                      onChangeText={setSignUpName}
                    />
                  </View>
                </View>

                {/* Birthday */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Birthday
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.inputBar}>
                    <View style={styles.fieldRow}>
                      <Calendar size={18} color={stylesVars.icon} />
                      <Text style={{ fontSize: 14, color: "#0B0F1A", flex: 1 }}>
                        {signUpBirthday
                          ? signUpBirthday.toLocaleDateString("en-PH")
                          : "Select your birthday"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={signUpBirthday ?? new Date(2000, 0, 1)}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(_, selected) => {
                      setShowDatePicker(false);
                      if (selected) setSignUpBirthday(selected);
                    }}
                  />
                )}

                {/* Email */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Email Address
                </Text>
                <View style={styles.inputBar}>
                  <View style={styles.fieldRow}>
                    <Mail size={18} color={stylesVars.icon} />
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor={stylesVars.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.textInput}
                      value={signUpEmail}
                      onChangeText={setSignUpEmail}
                    />
                  </View>
                </View>

                {/* Gender dropdown (unchanged) */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Gender
                </Text>

                <TouchableOpacity
                  onPress={() => setShowGenderMenu((prev) => !prev)}
                  activeOpacity={0.85}
                  style={{ marginBottom: showGenderMenu ? 6 : 12 }}
                >
                  <View style={styles.inputBar}>
                    <View style={styles.fieldRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: signUpGender
                              ? "#0B0F1A"
                              : stylesVars.placeholder,
                          }}
                        >
                          {signUpGender ?? "Select gender"}
                        </Text>
                      </View>
                      {showGenderMenu ? (
                        <ChevronUp size={18} color={stylesVars.icon} />
                      ) : (
                        <ChevronDown size={18} color={stylesVars.icon} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {showGenderMenu && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      backgroundColor: "#ffffff",
                      marginBottom: 12,
                      overflow: "hidden",
                    }}
                  >
                    {(["Male", "Female", "Other"] as const).map(
                      (option, index) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            setSignUpGender(option);
                            setShowGenderMenu(false);
                          }}
                          activeOpacity={0.8}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            backgroundColor:
                              signUpGender === option ? "#EFF6FF" : "#ffffff",
                            borderTopWidth: index === 0 ? 0 : 1,
                            borderTopColor: "#E5E7EB",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color:
                                signUpGender === option ? "#1D4ED8" : "#111827",
                              fontWeight:
                                signUpGender === option ? "600" : "400",
                            }}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Password
                </Text>
                <View style={styles.inputBar}>
                  <View style={styles.fieldRow}>
                    <Lock size={18} color={stylesVars.icon} />
                    <TextInput
                      placeholder="Create a password"
                      placeholderTextColor={stylesVars.placeholder}
                      secureTextEntry
                      style={styles.textInput}
                      value={signUpPassword}
                      onChangeText={setSignUpPassword}
                    />
                  </View>
                </View>

                {/* Address */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#4B5563",
                    marginBottom: 4,
                  }}
                >
                  Address
                </Text>
                <View style={styles.inputArea}>
                  <View style={[styles.fieldRow, { alignItems: "flex-start" }]}>
                    <MapPin size={18} color={stylesVars.icon} />
                    <TextInput
                      placeholder="Street, city, province, ZIP"
                      placeholderTextColor={stylesVars.placeholder}
                      style={[styles.textInput, { paddingTop: 0 }]}
                      multiline
                      value={signUpAddress}
                      onChangeText={setSignUpAddress}
                    />
                  </View>
                  {/* Error message inside buyer sign-up modal */}
                  {errorMsg && (
                    <Text style={[styles.errorText, { textAlign: "center" }]}>
                      {errorMsg}
                    </Text>
                  )}
                </View>

                {/* Actions */}

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: "#0B0F1A",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSignUpStep("role");
                    setShowSignUp(false);
                  }}
                  style={{ alignItems: "center", paddingVertical: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
      <Modal
        visible={showOrganizerModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOrganizerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={18}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.modalCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text
                style={{
                  fontSize: 20,
                  letterSpacing: 1,
                  color: "#0B0F1A",
                  textTransform: "uppercase",
                  fontFamily: "BebasNeue",
                  marginBottom: 8,
                }}
              >
                Organizer details
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 12,
                }}
              >
                Tell us about your organization so we can verify your events.
              </Text>

              {/* Organizer / company name */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                Organizer / Company Name
              </Text>
              <View style={styles.inputBar}>
                <View style={styles.fieldRow}>
                  <Building size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="e.g. Hype Productions"
                    placeholderTextColor={stylesVars.placeholder}
                    value={orgName}
                    onChangeText={setOrgName}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Event details */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                Event details
              </Text>
              <View style={styles.inputArea}>
                <View style={[styles.fieldRow, { alignItems: "flex-start" }]}>
                  <FileText size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Type of events, venues, expected size..."
                    placeholderTextColor={stylesVars.placeholder}
                    value={orgEventDetails}
                    onChangeText={setOrgEventDetails}
                    style={[styles.textInput, { paddingTop: 0 }]}
                    multiline
                  />
                </View>
              </View>

              {/* Contact info */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                Contact information
              </Text>
              <View style={styles.inputBar}>
                <View style={styles.fieldRow}>
                  <Phone size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Phone number or contact person"
                    placeholderTextColor={stylesVars.placeholder}
                    value={orgContact}
                    onChangeText={setOrgContact}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Organizer email */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                Organizer email
              </Text>
              <View style={styles.inputBar}>
                <View style={styles.fieldRow}>
                  <Mail size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Organizer contact email"
                    placeholderTextColor={stylesVars.placeholder}
                    value={orgEmail}
                    onChangeText={setOrgEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 4,
                }}
              >
                Password
              </Text>
              <View style={styles.inputBar}>
                <View style={styles.fieldRow}>
                  <Lock size={18} color={stylesVars.icon} />
                  <TextInput
                    placeholder="Create a password"
                    placeholderTextColor={stylesVars.placeholder}
                    secureTextEntry
                    style={styles.textInput}
                    value={orgPassword}
                    onChangeText={setOrgPassword}
                  />
                </View>
              </View>

              {/* Proof of legitimacy – images only */}
              <Text
                style={{
                  fontSize: 13,
                  color: "#4B5563",
                  marginBottom: 6,
                }}
              >
                Proof of legitimacy (images only)
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Upload permits, contracts, or screenshots/links of official
                social pages as images.
              </Text>

              <TouchableOpacity
                onPress={pickProofImages}
                activeOpacity={0.9}
                style={{
                  height: 40,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ImageIcon size={18} color="#1D4ED8" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#1D4ED8",
                    }}
                  >
                    Upload images
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Small preview row */}
              {orgProofImages.length > 0 && (
                <Text
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginBottom: 10,
                  }}
                >
                  {orgProofImages.length} image
                  {orgProofImages.length === 1 ? "" : "s"} selected
                </Text>
              )}

              {/* Actions */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  height: 44,
                  borderRadius: 999,
                  backgroundColor: "#0B0F1A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
                onPress={handleOrganizerSignUp}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  Continue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setErrorMsg(null); // clear old organizer error
                  setShowOrganizerModal(false); // close organizer modal
                }}
                style={{ alignItems: "center", paddingVertical: 4 }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const stylesVars = {
  placeholder: "#9CA3AF",
  icon: "#6B7280",
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
    width: 140,
    height: 140,
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
  inputBar: {
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  inputArea: {
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
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
    color: "#111827",
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 12,
    color: "rgba(17,24,39,0.65)",
    fontWeight: "500",
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
    marginBottom: 12,
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
  footer: {
    marginTop: 6,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(17,24,39,0.55)",
    marginBottom: 10,
    textAlign: "center",
  },
  footerLink: {
    color: "#0B0F1A",
    fontWeight: "600",
  },
  secondaryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "rgba(255,255,255,0.20)",
    overflow: "hidden",
  },
  secondaryPillText: {
    fontSize: 11,
    color: "rgba(17,24,39,0.7)",
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  modalCardInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
  modalScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
});

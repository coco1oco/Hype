// app/(auth)/login.tsx
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<"role" | "form">("role");
  const [signUpRole, setSignUpRole] =
    useState<"Organizer" | "Buyer" | null>(null);

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
  const [signUpGender, setSignUpGender] =
    useState<"Male" | "Female" | "Other" | null>(null);
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
    <LinearGradient
      colors={["#020617", "#0b1220", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Brand header */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={require("../../assets/hype1.png")}
              style={{ width: 200, height: 200, marginBottom: 6 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              Hype
            </Text>
            <Text
              style={{
                marginTop: 2,
                color: "rgba(255,255,255,0.78)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Welcome back! Sign in to continue
            </Text>
          </View>

          {/* LOGIN CARD – pointerEvents added so it cannot be touched under modal */}
          <View
            pointerEvents={anyModalOpen ? "none" : "auto"} // NEW
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 22,
              paddingVertical: 18,
              paddingHorizontal: 18,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 14,
              }}
            >
              Sign In
            </Text>

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
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ fontSize: 14, color: "#111827" }}
              />
            </View>

            {/* Password */}
            <Text
              style={{
                fontSize: 13,
                color: "#4B5563",
                marginBottom: 4,
              }}
            >
              Password
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 9,
                marginBottom: 6,
                backgroundColor: "#ffffff",
              }}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ fontSize: 14, color: "#111827" }}
              />
            </View>

            <View
              style={{
                alignItems: "flex-end",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#2563EB",
                    fontWeight: "500",
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* ERROR: only show when no modal is open */}
            {errorMsg && !anyModalOpen && (
  <Text style={{ color: "#DC2626", fontSize: 12, marginBottom: 8 }}>
    {errorMsg}
  </Text>
)}

            {/* Primary button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.9}
              style={{
                height: 44,
                borderRadius: 999,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
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
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Footer: open role selection + admin */}
<View style={{ marginTop: 12, alignItems: "center" }}>
  <Text
    style={{
      fontSize: 12,
      color: "#6B7280",
      marginBottom: 6,
    }}
  >
    Don&apos;t have an account?{" "}
    <Text
      style={{
        color: "#2563EB",
        fontWeight: "500",
      }}
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

  {/* Admin sign-in button */}
  <TouchableOpacity
    onPress={() => router.push("/(auth)/admin-login" as any)}
    activeOpacity={0.8}
    style={{
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(37,99,235,0.08)",
      marginTop: 2,
    }}
  >
    <Text
      style={{
        fontSize: 11,
        color: "#2563EB",
        fontWeight: "500",
      }}
    >
      Admin sign in
    </Text>
  </TouchableOpacity>
</View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ROLE + BUYER SIGN UP MODAL */}
      <Modal
        visible={showSignUp}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSignUp(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          {signUpStep === "role" ? (
            // STEP 1: ROLE SELECTION
            <View
              style={{
                width: "100%",
                borderRadius: 22,
                backgroundColor: "#F9FAFB",
                paddingHorizontal: 18,
                paddingVertical: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#111827",
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
                  backgroundColor: signUpRole ? "#2563EB" : "#93C5FD",
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
          ) : (
            // STEP 2: BUYER FORM (unchanged except final onPress uses handleSignUp)
            <View
              style={{
                width: "100%",
                borderRadius: 22,
                backgroundColor: "#F9FAFB",
                paddingHorizontal: 18,
                paddingVertical: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#111827",
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
  placeholder="Enter your name"
  placeholderTextColor="#9CA3AF"
  style={{ fontSize: 14, color: "#111827" }}
  value={signUpName}
  onChangeText={setSignUpName}
/>

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
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  marginBottom: 10,
                  backgroundColor: "#ffffff",
                  justifyContent: "center",
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 14, color: "#111827" }}>
                  {signUpBirthday
                    ? signUpBirthday.toLocaleDateString("en-PH")
                    : "Select your birthday"}
                </Text>
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
  placeholder="Enter your email"
  placeholderTextColor="#9CA3AF"
  keyboardType="email-address"
  autoCapitalize="none"
  style={{ fontSize: 14, color: "#111827" }}
  value={signUpEmail}
  onChangeText={setSignUpEmail}
/>

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
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: "#ffffff",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: showGenderMenu ? 6 : 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: signUpGender ? "#111827" : "#9CA3AF",
                  }}
                >
                  {signUpGender ?? "Select gender"}
                </Text>
                <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
                  {showGenderMenu ? "˄" : "˅"}
                </Text>
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
                              signUpGender === option
                                ? "#1D4ED8"
                                : "#111827",
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
    placeholder="Create a password"
    placeholderTextColor="#9CA3AF"
    secureTextEntry
    style={{ fontSize: 14, color: "#111827" }}
    value={signUpPassword}
    onChangeText={setSignUpPassword}
  />
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
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginBottom: 16,
                  backgroundColor: "#ffffff",
                }}
              >
                <TextInput
  placeholder="Street, city, province, ZIP"
  placeholderTextColor="#9CA3AF"
  style={{ fontSize: 14, color: "#111827" }}
  multiline
  value={signUpAddress}
  onChangeText={setSignUpAddress}
/>
{/* Error message inside buyer sign-up modal */}
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

              </View>

              {/* Actions */}
              
             <TouchableOpacity
  activeOpacity={0.9}
  style={{
    height: 44,
    borderRadius: 999,
    backgroundColor: "#2563EB",
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
            </View>
          )}
        </View>
      </Modal>
      <Modal
        visible={showOrganizerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOrganizerModal(false)}
      >
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    }}
  >
    <View
      style={{
        width: "100%",
        borderRadius: 22,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 18,
        paddingVertical: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: "#111827",
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
          placeholder="e.g. Hype Productions"
          placeholderTextColor="#9CA3AF"
          value={orgName}
          onChangeText={setOrgName}
          style={{ fontSize: 14, color: "#111827" }}
        />
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
      <View
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 8,
          marginBottom: 10,
          backgroundColor: "#ffffff",
        }}
      >
        <TextInput
          placeholder="Type of events, venues, expected size..."
          placeholderTextColor="#9CA3AF"
          value={orgEventDetails}
          onChangeText={setOrgEventDetails}
          style={{ fontSize: 14, color: "#111827" }}
          multiline
        />
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
          placeholder="Phone number or contact person"
          placeholderTextColor="#9CA3AF"
          value={orgContact}
          onChangeText={setOrgContact}
          style={{ fontSize: 14, color: "#111827" }}
        />
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
          placeholder="Organizer contact email"
          placeholderTextColor="#9CA3AF"
          value={orgEmail}
          onChangeText={setOrgEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ fontSize: 14, color: "#111827" }}
        />
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
    placeholder="Create a password"
    placeholderTextColor="#9CA3AF"
    secureTextEntry
    style={{ fontSize: 14, color: "#111827" }}
    value={orgPassword}
    onChangeText={setOrgPassword}
  />
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
        Upload permits, contracts, or screenshots/links of official social
        pages as images.
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
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "#1D4ED8",
          }}
        >
          Upload images
        </Text>
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
    backgroundColor: "#2563EB",
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
    setErrorMsg(null);      // clear old organizer error
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

    </View>
  </View>
</Modal>



    </LinearGradient>
  );
}

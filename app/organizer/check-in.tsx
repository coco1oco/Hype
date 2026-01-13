// app/organizer/check-in.tsx
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, QrCode } from "lucide-react-native";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CheckInScreen: React.FC = () => {
  const router = useRouter();
  const [ticketId, setTicketId] = React.useState("");
  const [checkingIn, setCheckingIn] = React.useState(false);

  const handleCheckIn = async (idFromInput?: string) => {
    const idToUse = (idFromInput ?? ticketId).trim();

    if (!idToUse) {
      Alert.alert("Check-in", "Please enter a ticket ID first.");
      return;
    }

    try {
      setCheckingIn(true);

      // Only check in tickets that are not yet checked_in
      const { data, error } = await supabase
        .from("tickets")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", idToUse)
        .eq("checked_in", false)
        .select(
          "id, buyer_name, buyer_email, tier_name, quantity, status, checked_in"
        )
        .single();

      if (error) {
        console.error("Failed to check in ticket:", error.message);
        Alert.alert("Check-in failed", error.message);
        return;
      }

      if (!data) {
        Alert.alert("Check-in", "Ticket not found or already checked in.");
        return;
      }

      Alert.alert(
        "Check-in successful",
        `${data.buyer_name ?? "Guest"} is now checked in.`
      );

      // Clear manual input after success
      setTicketId("");
    } finally {
      setCheckingIn(false);
    }
  };

  // For now, simulate QR by using whatever is in ticketId
  const handleSimulateQrScan = () => {
    handleCheckIn();
  };

  return (
    <LinearGradient
      colors={["#020617", "#0b1220", "#020617"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <ArrowLeft size={18} color="#111827" />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                color: "#E5E7EB",
              }}
            >
              Back to Event Details
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#F9FAFB",
                marginBottom: 4,
              }}
            >
              Check-In Scanner
            </Text>

            <View
              style={{
                height: 5,
                borderRadius: 999,
                backgroundColor: "#E5E7EB",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(1 / 4) * 100}%`,
                  height: "100%",
                  backgroundColor: "#2563EB",
                }}
              />
            </View>
          </View>

          {/* QR Code Scanner card */}
          <View
            style={{
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 10,
              }}
            >
              QR Code Scanner
            </Text>

            <View
              style={{
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                paddingVertical: 32,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <QrCode size={64} color="#9CA3AF" />
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                Camera not active
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                borderRadius: 999,
                backgroundColor: "#2563EB",
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
              // TODO: hook up real camera scanner later
            >
              <Camera size={16} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginLeft: 6,
                }}
              >
                Start Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                borderRadius: 999,
                backgroundColor: "#16A34A",
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleSimulateQrScan}
              disabled={checkingIn}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                {checkingIn ? "Checking in..." : "Simulate QR Scan (Demo)"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Ticket Entry card */}
          <View
            style={{
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Manual Ticket Entry
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  backgroundColor: "#F9FAFB",
                  paddingHorizontal: 14,
                  height: 42,
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <TextInput
                  placeholder="Enter ticket ID..."
                  placeholderTextColor="#9CA3AF"
                  value={ticketId}
                  onChangeText={setTicketId}
                  style={{ fontSize: 13, color: "#111827" }}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  width: 90,
                  height: 42,
                  borderRadius: 999,
                  backgroundColor: "#2563EB",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: checkingIn ? 0.7 : 1,
                }}
                onPress={() => handleCheckIn()}
                disabled={checkingIn}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {checkingIn ? "..." : "Check In"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 11,
                color: "#6B7280",
              }}
            >
              Use this if QR scanning is not available.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CheckInScreen;

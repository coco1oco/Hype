// app/(tabs)/tickets/index.tsx
import { supabase } from "@/lib/supabase";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TicketsScreen: React.FC = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<any[]>([]);

  // Focus animation
  const isFocused = useIsFocused();
  const focusProgress = useSharedValue(0);

  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: isFocused ? 280 : 140,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, focusProgress]);

  const focusStyle = useAnimatedStyle(() => {
    return {
      opacity: focusProgress.value,
      transform: [{ translateY: (1 - focusProgress.value) * 8 }],
    };
  });

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          id,
          event_id,
          buyer_name,
          buyer_email,
          quantity,
          tier_name,
          created_at,
          status,
          event:event_id (
            id,
            name
          )
        `
        )
        .eq("buyer_id", userId)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("tickets load error", error.message);
        setTickets([]);
      } else {
        setTickets(data ?? []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: tabBarHeight + 32,
            maxWidth: 900,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#F9FAFB",
              marginBottom: 4,
            }}
          >
            My Tickets
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#94A3B8",
              marginBottom: 16,
            }}
          >
            Your confirmed passes, ready to scan at the gate.
          </Text>

          {loading ? (
            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Loading…</Text>
          ) : tickets.length === 0 ? (
            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
              You don’t have any issued tickets yet.
            </Text>
          ) : (
            tickets.map((t) => {
              const created =
                t.created_at &&
                new Date(t.created_at).toLocaleString("en-PH", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });

              return (
                <View
                  key={t.id}
                  style={{
                    backgroundColor: "#0B1220",
                    borderRadius: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "rgba(148,163,184,0.35)",
                    shadowColor: "#000",
                    shadowOpacity: 0.22,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    overflow: "hidden",
                  }}
                >
                  {/* top section */}
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingTop: 12,
                      paddingBottom: 10,
                      backgroundColor: "#111827",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        marginBottom: 2,
                      }}
                    >
                      {t.event?.name ?? "Event"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#E5E7EB",
                      }}
                    >
                      Ticket ID: {t.id}
                    </Text>
                    {created && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginTop: 2,
                        }}
                      >
                        Issued {created}
                      </Text>
                    )}
                  </View>

                  {/* middle: QR + details */}
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#0B1220",
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      gap: 12,
                    }}
                  >
                    {/* QR side */}
                    <View
                      style={{
                        width: 140,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 4,
                      }}
                    >
                      <View
                        style={{
                          padding: 6,
                          borderRadius: 16,
                          backgroundColor: "#0F172A",
                          borderWidth: 1,
                          borderColor: "rgba(148,163,184,0.25)",
                        }}
                      >
                        <QRCode value={t.id} size={120} />
                      </View>
                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: "#94A3B8",
                        }}
                      >
                        Show this code at entry
                      </Text>
                    </View>

                    {/* info side */}
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#E5E7EB",
                          marginBottom: 6,
                        }}
                      >
                        {t.quantity ?? 1} ticket
                        {(t.quantity ?? 1) > 1 ? "s" : ""} ·{" "}
                        {t.tier_name ?? "General"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#94A3B8",
                          marginBottom: 2,
                        }}
                      >
                        Buyer: {t.buyer_name || t.buyer_email}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          marginTop: 4,
                        }}
                      >
                        Status:{" "}
                        <Text style={{ color: "#34D399", fontWeight: "600" }}>
                          {t.status}
                        </Text>
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{ marginTop: 10 }}
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/event/[id]",
                            params: { id: String(t.event_id) },
                          })
                        }
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#60A5FA",
                            fontWeight: "600",
                          }}
                        >
                          View event →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default TicketsScreen;

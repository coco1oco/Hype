// app/tickets/index.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import QRCode from "react-native-qrcode-svg";
import { Home, Heart, Ticket as TicketIcon } from "lucide-react-native";

type Tab = {
  key: "home" | "saved" | "tickets";
  label: string;
  icon: React.ComponentType<any>;
  href: string;
};

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home, href: "/event" },
  { key: "saved", label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets", label: "Tickets", icon: TicketIcon, href: "/tickets" },
];

const TicketsScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<any[]>([]);

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
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 120, // leave space for navbar
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
              color: "#6B7280",
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
                    backgroundColor: "#020617",
                    borderRadius: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "rgba(148,163,184,0.45)",
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
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
                      backgroundColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
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
                          color: "#6B7280",
                          marginTop: 2,
                        }}
                      >
                        Issued {created}
                      </Text>
                    )}
                  </View>

                  {/* separator */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "rgba(31,41,55,0.9)",
                      marginHorizontal: 12,
                    }}
                  />

                  {/* middle: QR + details */}
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#E5E7EB",
                      paddingHorizontal: 14,
                      paddingVertical: 10,
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
                        }}
                      >
                        <QRCode value={t.id} size={120} />
                      </View>
                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: "#9CA3AF",
                        }}
                      >
                        Show this code at entry
                      </Text>
                    </View>

                    {/* info side */}
                    <View
                      style={{
                        flex: 1,
                        paddingLeft: 12,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#E5E7EB",
                          marginBottom: 2,
                        }}
                      >
                        {t.quantity ?? 1} ticket
                        {(t.quantity ?? 1) > 1 ? "s" : ""} ·{" "}
                        {t.tier_name ?? "General"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginBottom: 2,
                        }}
                      >
                        Buyer: {t.buyer_name || t.buyer_email}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          marginTop: 4,
                        }}
                      >
                        Status:{" "}
                        <Text style={{ color: "#34D399", fontWeight: "600" }}>
                          {t.status}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* bottom strip */}
                  <View
                    style={{
                      backgroundColor: "#E5E7EB",
                      borderTopWidth: 1,
                      borderTopColor: "rgba(31,41,55,0.9)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                      }}
                    >
                      Event ID: {t.event_id}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({
                          pathname: "/event/[id]",
                          params: { id: t.event_id },
                        } as any)
                      }
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#60A5FA",
                          fontWeight: "600",
                        }}
                      >
                        View event →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom nav (same style as event details, tickets active) */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 24,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 900,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                height: 64,
                borderRadius: 32,
                backgroundColor: "#fff",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              {tabs.map(({ key, label, icon: Icon, href }) => {
                const isActive = key === "tickets";

                return (
                  <TouchableOpacity
                    key={key}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (!isActive) router.push(href as any);
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        backgroundColor: isActive ? "#E5F0FF" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Icon
                        size={18}
                        color={isActive ? "#007AFF" : "#8E8E93"}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: isActive ? "#007AFF" : "#8E8E93",
                        fontWeight: isActive ? "600" : "400",
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TicketsScreen;

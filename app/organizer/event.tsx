// app/organizer/event.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { Calendar, MapPin, ArrowLeft } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

type TabKey = "overview" | "pending" | "attendees";

const OrganizerEventScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");

  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any | null>(null);

  const [ticketsSold, setTicketsSold] = React.useState(0);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [totalAttendees, setTotalAttendees] = React.useState(0);

  // seats reserved by approved purchases
  const [approvedSeats, setApprovedSeats] = React.useState(0);

  const [pendingPayments, setPendingPayments] = React.useState<any[]>([]);
  const [attendees, setAttendees] = React.useState<any[]>([]);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  // ---- shared load function so we can refresh on focus too ----
  const load = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);

    // 1) Event details
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select(
        "id, name, date, location, description, tier_name, tier_price, tier_seats"
      )
      .eq("id", id)
      .single();

    if (eventError) {
      console.error("organizer event error", eventError.message);
    }

    // 2) All tickets for this event (checked_in + quantity + price)
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(
        "id, buyer_name, buyer_email, tier_name, quantity, price, status, created_at, checked_in"
      )
      .eq("event_id", id);

    if (ticketsError) {
      console.error("tickets error", ticketsError.message);
    }

    // 3) Approved purchases for this event from purchases table
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("quantity")
      .eq("event_id", id)
      .eq("status", "approved");

    if (purchasesError) {
      console.error("approved purchases error", purchasesError.message);
    }

    if (eventData) {
      setEvent(eventData);
    }

    if (tickets) {
      const paidTickets = tickets.filter((t: any) => t.status === "paid");

      // total seats sold = sum of quantity for paid tickets
      const soldCount = paidTickets.reduce(
        (sum: number, t: any) => sum + (t.quantity ?? 1),
        0
      );
      setTicketsSold(soldCount);

      // revenue = sum of quantity * price
      const revenue = paidTickets.reduce((sum: number, t: any) => {
        const qty = t.quantity ?? 1;
        const price = Number(t.price ?? 0);
        return sum + qty * price;
      }, 0);
      setTotalRevenue(revenue);

      // checked-in attendees = sum of quantity for paid + checked_in
      const checkedInTickets = paidTickets.filter(
        (t: any) => t.checked_in === true
      );
      const checkedInCount = checkedInTickets.reduce(
        (sum: number, t: any) => sum + (t.quantity ?? 1),
        0
      );
      setTotalAttendees(checkedInCount);

      const pending = tickets.filter((t: any) => t.status === "pending");
      setPendingPayments(pending);

      setAttendees(paidTickets);
    }

    if (purchases) {
      const approvedCount = purchases.reduce(
        (sum: number, p: any) => sum + (p.quantity ?? 0),
        0
      );
      setApprovedSeats(approvedCount);
    }

    setLoading(false);
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Re-run load whenever this screen comes back into focus (after check-in)
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  // ---- confirmPayment keeps local metrics in sync immediately ----
  const confirmPayment = async (ticketId: string) => {
    const ticket = pendingPayments.find((t) => t.id === ticketId);
    if (!ticket) return;

    const qty = ticket.quantity ?? 1;
    const price = Number(ticket.price ?? 0);
    const amount = qty * price;

    try {
      setConfirmingId(ticketId);

      const { data, error } = await supabase
        .from("tickets")
        .update({ status: "paid" })
        .eq("id", ticketId)
        .select(
          "id, buyer_name, buyer_email, tier_name, quantity, price, status"
        )
        .single();

      if (error || !data) {
        console.error("Failed to confirm payment:", error?.message);
        Alert.alert("Error", error?.message ?? "Failed to confirm payment.");
        return;
      }

      const issuedTicketId = data.id as string;

      setPendingPayments((prev) => prev.filter((t) => t.id !== ticketId));
      setAttendees((prev) => [...prev, data]);

      setTicketsSold((prev) => prev + qty);
      setTotalRevenue((prev) => prev + amount);

      Alert.alert(
        "Ticket issued",
        `Ticket ID:\n${issuedTicketId}\n\nBuyer: ${
          data.buyer_name ?? "Unknown buyer"
        }`
      );
    } finally {
      setConfirmingId(null);
    }
  };

  if (!id) {
    return (
      <LinearGradient
        colors={["#020617", "#0b1220", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#F9FAFB" }}>No event selected.</Text>
      </LinearGradient>
    );
  }

  if (loading || !event) {
    return (
      <LinearGradient
        colors={["#020617", "#0b1220", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator color="#60A5FA" />
      </LinearGradient>
    );
  }

  const eventName = event.name ?? "Untitled event";
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString()
    : "TBA";
  const eventLocation = event.location ?? "TBA";
  const description =
    event.description ?? "No description has been provided for this event.";

  const capacity = event.tier_seats ?? 0;

  // seats reserved by approved purchases (will attend)
  const willAttend = approvedSeats;
  const seatsLeft = Math.max(capacity - willAttend, 0);

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
          {/* Back to dashboard */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <ArrowLeft size={18} color="#E5E7EB" />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                color: "#E5E7EB",
              }}
            >
              Back to Dashboard
            </Text>
          </TouchableOpacity>

          {/* Header card */}
          <View
            style={{
              borderRadius: 20,
              backgroundColor: "rgba(15,23,42,0.95)",
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.4)",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#F9FAFB",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {eventName}
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
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor: "rgba(22,163,74,0.2)",
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: "#22C55E",
                        marginRight: 4,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: "#BBF7D0",
                        textTransform: "uppercase",
                      }}
                    >
                      approved
                    </Text>
                  </View>

                  <Calendar size={14} color="#E5E7EB" />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      color: "#E5E7EB",
                    }}
                  >
                    {eventDate}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={14} color="#9CA3AF" />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      color: "#9CA3AF",
                    }}
                    numberOfLines={1}
                  >
                    {eventLocation}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#4F46E5", "#2563EB", "#0EA5E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={26} color="#F9FAFB" />
                </LinearGradient>
              </View>
            </View>

            <View style={{ flexDirection: "row", columnGap: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 999,
                  backgroundColor: "#22C55E",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => router.push("/organizer/check-in" as any)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#022C22",
                  }}
                >
                  Check-In
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Metrics row */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 10,
              marginBottom: 12,
            }}
          >
            {/* Tickets sold */}
            <View
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: "#0F172A",
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.35)",
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}
              >
                Tickets Sold
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#F9FAFB",
                }}
              >
                {ticketsSold}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                {capacity > 0
                  ? `Out of ${capacity} capacity`
                  : "Capacity not set"}
              </Text>
            </View>

            {/* Total revenue */}
            <View
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: "#0F172A",
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.35)",
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}
              >
                Total Revenue
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#F9FAFB",
                }}
              >
                ₱{totalRevenue.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                {ticketsSold > 0
                  ? `Avg ₱${Math.round(
                      totalRevenue / ticketsSold
                    ).toLocaleString()} per ticket`
                  : "No tickets sold yet"}
              </Text>
            </View>
          </View>

          {/* Attendees + seats from purchases */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: "#0F172A",
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.35)",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}
            >
              Attendance & Seats
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#F9FAFB",
                marginBottom: 2,
              }}
            >
              Checked-in attendees: {totalAttendees}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#F9FAFB",
                marginBottom: 2,
              }}
            >
              Approved purchases (will attend): {willAttend}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                marginTop: 2,
              }}
            >
              Seats left based on approved purchases: {seatsLeft}
            </Text>
          </View>

          {/* Tabs row */}
          <View
            style={{
              flexDirection: "row",
              borderRadius: 999,
              backgroundColor: "#020617",
              padding: 2,
              borderWidth: 1,
              borderColor: "rgba(31,41,55,0.9)",
              marginBottom: 14,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                backgroundColor:
                  activeTab === "overview" ? "#111827" : "transparent",
              }}
              onPress={() => setActiveTab("overview")}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: activeTab === "overview" ? "#F9FAFB" : "#9CA3AF",
                }}
              >
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                backgroundColor:
                  activeTab === "pending" ? "#111827" : "transparent",
              }}
              onPress={() => setActiveTab("pending")}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: activeTab === "pending" ? "#F9FAFB" : "#9CA3AF",
                }}
              >
                Pending Payments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                backgroundColor:
                  activeTab === "attendees" ? "#111827" : "transparent",
              }}
              onPress={() => setActiveTab("attendees")}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: activeTab === "attendees" ? "#F9FAFB" : "#9CA3AF",
                }}
              >
                Attendees
              </Text>
            </TouchableOpacity>
          </View>

          {/* OVERVIEW CONTENT */}
          {activeTab === "overview" && (
            <>
              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: "#0F172A",
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.35)",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#F9FAFB",
                    marginBottom: 6,
                  }}
                >
                  Event Description
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#D1D5DB",
                    lineHeight: 18,
                  }}
                >
                  {description}
                </Text>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: "#0F172A",
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.35)",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#F9FAFB",
                    marginBottom: 8,
                  }}
                >
                  Seat Availability by Tier
                </Text>

                {[
                  {
                    name: event.tier_name ?? "VIP",
                    sold: ticketsSold,
                    total: capacity || ticketsSold || 1,
                  },
                ].map((tier) => {
                  const ratio = tier.total ? tier.sold / tier.total : 0;
                  const available = Math.max(tier.total - tier.sold, 0);

                  return (
                    <View key={tier.name} style={{ marginBottom: 10 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E5E7EB",
                            fontWeight: "500",
                          }}
                        >
                          {tier.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          {available} / {tier.total} available
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 6,
                          borderRadius: 999,
                          backgroundColor: "#1F2937",
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(ratio * 100, 100)}%`,
                            height: "100%",
                            backgroundColor: "#2563EB",
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* PENDING TAB */}
          {activeTab === "pending" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                marginBottom: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.35)",
                backgroundColor: "#0F172A",
              }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ minWidth: 720 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#020617",
                    borderBottomWidth: 1,
                    borderBottomColor: "#1F2937",
                  }}
                >
                  <View
                    style={{
                      flex: 2.2,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRightWidth: 1,
                      borderRightColor: "#1F2937",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                      BUYER
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRightWidth: 1,
                      borderRightColor: "#1F2937",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                      TIER
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRightWidth: 1,
                      borderRightColor: "#1F2937",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        textAlign: "center",
                      }}
                    >
                      QUANTITY
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1.3,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRightWidth: 1,
                      borderRightColor: "#1F2937",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        textAlign: "center",
                      }}
                    >
                      AMOUNT
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1.2,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRightWidth: 1,
                      borderRightColor: "#1F2937",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        textAlign: "center",
                      }}
                    >
                      DATE
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 150,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                      ACTION
                    </Text>
                  </View>
                </View>

                {pendingPayments.length === 0 && (
                  <View
                    style={{
                      padding: 16,
                      backgroundColor: "#020617",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                      }}
                    >
                      No pending payments for this event.
                    </Text>
                  </View>
                )}

                {pendingPayments.map((row) => {
                  const qty = row.quantity ?? 1;
                  const price = Number(row.price ?? 0);
                  const amount = qty * price;

                  return (
                    <View
                      key={row.id}
                      style={{
                        flexDirection: "row",
                        backgroundColor: "#020617",
                        borderBottomWidth: 1,
                        borderBottomColor: "#1F2937",
                      }}
                    >
                      <View
                        style={{
                          flex: 2.2,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRightWidth: 1,
                          borderRightColor: "#1F2937",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#F9FAFB",
                            fontWeight: "600",
                            marginBottom: 2,
                          }}
                        >
                          {row.buyer_name ?? "Unknown buyer"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          {row.buyer_email ?? "No email"}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRightWidth: 1,
                          borderRightColor: "#1F2937",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#E5E7EB" }}>
                          {row.tier_name ?? event.tier_name ?? "-"}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRightWidth: 1,
                          borderRightColor: "#1F2937",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E5E7EB",
                            textAlign: "center",
                          }}
                        >
                          {qty}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1.3,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRightWidth: 1,
                          borderRightColor: "#1F2937",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E5E7EB",
                            textAlign: "center",
                          }}
                        >
                          ₱{amount.toLocaleString()}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1.2,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRightWidth: 1,
                          borderRightColor: "#1F2937",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E5E7EB",
                            textAlign: "center",
                          }}
                        >
                          {row.created_at
                            ? new Date(
                                row.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </Text>
                      </View>

                      <View
                        style={{
                          width: 150,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.9}
                          style={{
                            borderRadius: 999,
                            backgroundColor: "#16A34A",
                            paddingVertical: 6,
                            paddingHorizontal: 16,
                            opacity:
                              confirmingId === row.id ? 0.7 : 1,
                          }}
                          onPress={() => confirmPayment(row.id)}
                          disabled={confirmingId === row.id}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "600",
                              color: "#FFFFFF",
                            }}
                          >
                            {confirmingId === row.id
                              ? "Issuing..."
                              : "Confirm & Issue Ticket"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </ScrollView>
          )}

          {/* ATTENDEES TAB */}
          {activeTab === "attendees" && (
            <View
              style={{
                borderRadius: 16,
                backgroundColor: "#0F172A",
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.35)",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#F9FAFB",
                  marginBottom: 6,
                }}
              >
                Attendees
              </Text>

              {attendees.length === 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#D1D5DB",
                  }}
                >
                  No paid attendees yet.
                </Text>
              ) : (
                attendees.map((t) => (
                  <View
                    key={t.id}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: "#1F2937",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#F9FAFB",
                        fontWeight: "500",
                      }}
                    >
                      {t.buyer_name ?? "Unknown buyer"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 2,
                      }}
                    >
                      {t.buyer_email ?? "No email"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                      }}
                    >
                      {t.quantity ?? 1} ticket
                      {(t.quantity ?? 1) > 1 ? "s" : ""} ·{" "}
                      {t.tier_name ?? event.tier_name ?? "-"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OrganizerEventScreen;

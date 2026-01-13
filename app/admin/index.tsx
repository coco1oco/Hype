// app/admin/index.tsx
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { ShieldCheck, Ticket, Users } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AdminDashboardScreen: React.FC = () => {
  const [pendingEvents, setPendingEvents] = React.useState<any[]>([]);
  const [loadingPending, setLoadingPending] = React.useState(false);

  const [pendingPurchases, setPendingPurchases] = React.useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = React.useState(false);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // dynamic metrics
  const [totalUsers, setTotalUsers] = React.useState<number | null>(null);
  const [activeEvents, setActiveEvents] = React.useState<number | null>(null);
  const pendingApprovals = pendingEvents.length + pendingPurchases.length;

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (typeof usersCount === "number") {
        setTotalUsers(usersCount);
      }

      const { count: eventsCount } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");

      if (typeof eventsCount === "number") {
        setActiveEvents(eventsCount);
      }
    };

    const fetchPendingEvents = async () => {
      setLoadingPending(true);
      const { data, error } = await supabase
        .from("events")
        .select("id, name, location, created_at, status, proof_images")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!error && data) setPendingEvents(data);
      setLoadingPending(false);
    };

    const fetchPendingPurchases = async () => {
      setLoadingPurchases(true);
      const { data, error } = await supabase
        .from("purchases")
        .select(
          "id, event_id, buyer_id, quantity, created_at, status, proof_path"
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

      if (!error && data) setPendingPurchases(data);
      setLoadingPurchases(false);
    };

    fetchDashboardData();
    fetchPendingEvents();
    fetchPendingPurchases();
  }, []);

  const updateEventStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error.message);
      return;
    }

    setPendingEvents((prev) => prev.filter((e) => e.id !== id));

    if (status === "approved") {
      setActiveEvents((prev) => (prev ?? 0) + 1);
    }
  };

  const updatePurchaseStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    if (status === "rejected") {
      const { error } = await supabase
        .from("purchases")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("Failed to update purchase status:", error.message);
        return;
      }

      setPendingPurchases((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    // 1) Load purchase being approved (without changing status yet)
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, event_id, buyer_id, quantity")
      .eq("id", id)
      .single();

    if (purchaseError || !purchase) {
      console.error("Failed to load purchase:", purchaseError?.message);
      return;
    }

    const requestedQty = purchase.quantity ?? 1;

    // 2) Load event capacity + tier info
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("tier_seats, tier_price, tier_name")
      .eq("id", purchase.event_id)
      .single();

    if (eventError || !eventData) {
      console.error("Failed to load event for capacity:", eventError?.message);
      return;
    }

    const totalSeats = eventData.tier_seats ?? 0;

    // 3) Compute already sold seats (all paid tickets)
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("quantity")
      .eq("event_id", purchase.event_id)
      .eq("status", "paid");

    if (ticketsError) {
      console.error("Failed to load existing tickets:", ticketsError.message);
      return;
    }

    const alreadySold = (tickets ?? []).reduce(
      (sum: number, t: any) => sum + (t.quantity ?? 1),
      0
    );
    const seatsLeft = totalSeats - alreadySold;

    // 4) Validate capacity
    if (totalSeats > 0 && requestedQty > seatsLeft) {
      Alert.alert(
        "Cannot approve purchase",
        `Only ${seatsLeft} tickets left for this event. Requested ${requestedQty}.`
      );
      // optionally mark as rejected
      await supabase
        .from("purchases")
        .update({ status: "rejected" })
        .eq("id", id);
      setPendingPurchases((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    // 5) Safe to approve: update purchase status
    const { error: approveError } = await supabase
      .from("purchases")
      .update({ status: "approved" })
      .eq("id", id);

    if (approveError) {
      console.error("Failed to approve purchase:", approveError.message);
      return;
    }

    const ticketPrice = Number(eventData.tier_price ?? 0);
    const ticketTierName = eventData.tier_name ?? null;

    // 6) Fetch buyer profile for name/email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", purchase.buyer_id)
      .single();

    if (profileError) {
      console.warn("Could not load buyer profile:", profileError.message);
    }

    const buyerName = profile?.full_name ?? null;
    const buyerEmail = profile?.email ?? null;

    // 7) Create ticket row linked to this purchase
    const { error: ticketError } = await supabase.from("tickets").insert({
      event_id: purchase.event_id,
      buyer_id: purchase.buyer_id,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      quantity: requestedQty,
      tier_name: ticketTierName,
      price: ticketPrice,
      status: "paid",
    });

    if (ticketError) {
      console.error("Failed to create ticket:", ticketError.message);
      return;
    }

    setPendingPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <LinearGradient
      colors={["#020617", "#0b1220", "#020617"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#F9FAFB",
                  marginBottom: 4,
                }}
              >
                Admin Dashboard
              </Text>
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                System overview and platform controls
              </Text>
            </View>
          </View>

          {/* Top metric cards */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 10,
              marginBottom: 10,
            }}
          >
            {/* Total users */}
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Total Users
                </Text>
                <Users size={16} color="#38BDF8" />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#F9FAFB",
                }}
              >
                {totalUsers ?? "—"}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                Organizers & buyers combined
              </Text>
            </View>

            {/* Active approved events */}
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Active Events
                </Text>
                <Ticket size={16} color="#22C55E" />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#F9FAFB",
                }}
              >
                {activeEvents ?? "—"}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                Approved events
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              columnGap: 10,
              marginBottom: 16,
            }}
          >
            {/* Pending approvals summary card */}
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Pending Approvals
                </Text>
                <ShieldCheck size={16} color="#fb7185" />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#F9FAFB",
                }}
              >
                {pendingApprovals}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginTop: 2,
                }}
              >
                Events & purchases to review
              </Text>
            </View>
          </View>

          {/* Filter chips (optional) */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 12,
              columnGap: 8,
            }}
          >
            {["All"].map((label, idx) => {
              const active = idx === 0;
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.9}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: active ? "#111827" : "#020617",
                    borderWidth: 1,
                    borderColor: active
                      ? "rgba(148,163,184,0.8)"
                      : "rgba(31,41,55,0.9)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "500",
                      color: active ? "#F9FAFB" : "#9CA3AF",
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pending event approvals */}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#F9FAFB",
                }}
              >
                Pending Event Approvals
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                }}
              >
                {loadingPending
                  ? "Loading..."
                  : `${pendingEvents.length} awaiting review`}
              </Text>
            </View>

            {pendingEvents.length === 0 && !loadingPending && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                No events awaiting approval.
              </Text>
            )}

            {pendingEvents.map((e) => (
              <View
                key={e.id}
                style={{
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#1F2937",
                  marginTop: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#F9FAFB",
                        fontWeight: "500",
                      }}
                    >
                      {e.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginTop: 2,
                      }}
                    >
                      {e.location} · Submitted{" "}
                      {new Date(e.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", columnGap: 6 }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => updateEventStatus(e.id, "approved")}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: "rgba(22,163,74,0.15)",
                        borderWidth: 1,
                        borderColor: "rgba(34,197,94,0.8)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#4ADE80",
                        }}
                      >
                        Approve
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => updateEventStatus(e.id, "rejected")}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: "rgba(248,113,113,0.08)",
                        borderWidth: 1,
                        borderColor: "rgba(248,113,113,0.9)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#FCA5A5",
                        }}
                      >
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {Array.isArray(e.proof_images) && e.proof_images.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      Proof of legitimacy:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {e.proof_images.map((url: string, idx: number) => (
                        <TouchableOpacity
                          key={`${e.id}-proof-${idx}`}
                          activeOpacity={0.9}
                          onPress={() => setPreviewUrl(url)}
                        >
                          <Image
                            source={{ uri: url }}
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 10,
                              marginRight: 8,
                              backgroundColor: "#020617",
                            }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Pending purchase approvals */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: "#0F172A",
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.35)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#F9FAFB",
                }}
              >
                Pending Purchase Approvals
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                }}
              >
                {loadingPurchases
                  ? "Loading..."
                  : `${pendingPurchases.length} awaiting review`}
              </Text>
            </View>

            {pendingPurchases.length === 0 && !loadingPurchases && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                No purchases awaiting approval.
              </Text>
            )}

            {pendingPurchases.map((p) => (
              <View
                key={p.id}
                style={{
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#1F2937",
                  marginTop: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#F9FAFB",
                        fontWeight: "500",
                      }}
                    >
                      Event ID: {p.event_id}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginTop: 2,
                      }}
                    >
                      Purchase #{p.id} · Submitted{" "}
                      {new Date(p.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", columnGap: 6 }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => updatePurchaseStatus(p.id, "approved")}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: "rgba(22,163,74,0.15)",
                        borderWidth: 1,
                        borderColor: "rgba(34,197,94,0.8)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#4ADE80",
                        }}
                      >
                        Approve
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => updatePurchaseStatus(p.id, "rejected")}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: "rgba(248,113,113,0.08)",
                        borderWidth: 1,
                        borderColor: "rgba(248,113,113,0.9)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#FCA5A5",
                        }}
                      >
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {p.proof_path && (
                  <View style={{ marginTop: 4 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      GCash proof screenshot:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          const { data } = supabase.storage
                            .from("payments")
                            .getPublicUrl(p.proof_path);
                          if (data?.publicUrl) {
                            setPreviewUrl(data.publicUrl);
                          }
                        }}
                      >
                        <View
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            marginRight: 8,
                            backgroundColor: "#020617",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#E5E7EB",
                              textAlign: "center",
                            }}
                          >
                            Tap to preview
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Fullscreen image preview */}
        {previewUrl && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 40,
                right: 24,
                zIndex: 10,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "rgba(15,23,42,0.9)",
              }}
              onPress={() => setPreviewUrl(null)}
            >
              <Text
                style={{
                  color: "#F9FAFB",
                  fontSize: 14,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>

            <Image
              source={{ uri: previewUrl }}
              style={{
                width: "90%",
                height: "70%",
                borderRadius: 16,
                backgroundColor: "#020617",
              }}
              resizeMode="contain"
            />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AdminDashboardScreen;

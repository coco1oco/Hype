// app/purchase/[id].tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

const PurchaseScreen: React.FC = () => {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any | null>(null);

  // modal state
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("purchase event error", eventError);
      }

      setEvent(eventData ?? null);
      setLoading(false);
    };

    load();
  }, [eventId]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading tickets…</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const baseTierName = event.tier_name;
  const baseTierPrice = Number(event.tier_price ?? 0);
  const baseTierSeats = event.tier_seats ?? 0;

  const totalPrice = baseTierPrice * quantity;

  const increaseQty = () => {
    // cap at total seats
    if (quantity < baseTierSeats) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // when user confirms purchase in modal
  const handleConfirmPurchase = () => {
    setShowCheckoutModal(false);

    // navigate to checkout screen where GCash number + proof upload lives
    router.push({
      pathname: "/purchase/checkout/[id]",
      params: {
        id: eventId as string,
        // optional extras if you want them in checkout:
        quantity: String(quantity),
        totalPrice: String(totalPrice),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#fff",
            alignSelf: "flex-start",
            marginBottom: 12,
          }}
        >
          <Text>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Purchase Tickets
        </Text>

        {/* Event header card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: "#111827",
              marginRight: 12,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              {event.name || event.title}
            </Text>
            <Text style={{ fontSize: 12, color: "#4B5563" }}>
              {new Date(event.date || event.start_time).toLocaleString(
                "en-PH",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginTop: 4,
              }}
            >
              {event.location || `${event.venue}, ${event.city}`}
            </Text>
          </View>
        </View>

        {/* Organizer tier summary */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Ticket tier
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
            This is the tier created by the organizer.
          </Text>

          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 12,
              backgroundColor: "#F9FAFB",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              {baseTierName || "General Admission"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#4B5563",
                marginBottom: 4,
              }}
            >
              Seats created: {baseTierSeats}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#4B5563",
              }}
            >
              Base price: PHP {baseTierPrice.toLocaleString("en-PH")}
            </Text>
          </View>

          {/* CTA – opens modal */}
          <TouchableOpacity
            style={{
              marginTop: 16,
              borderRadius: 999,
              backgroundColor: "#2563EB",
              paddingVertical: 12,
              alignItems: "center",
            }}
            onPress={() => {
              setQuantity(1);
              setShowCheckoutModal(true);
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              Continue to checkout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Checkout modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            {/* drag handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: "#E5E7EB",
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
                color: "#111827",
              }}
            >
              Checkout
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginBottom: 12,
              }}
            >
              {event.name || event.title} · {baseTierName || "General Admission"}
            </Text>

            {/* Quantity controls */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  Quantity
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  Max {baseTierSeats} tickets
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={decreaseQty}
                  disabled={quantity <= 1}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor:
                      quantity <= 1 ? "#F9FAFB" : "#EEF2FF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: quantity <= 1 ? "#9CA3AF" : "#4F46E5",
                    }}
                  >
                    −
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={increaseQty}
                  disabled={quantity >= baseTierSeats}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor:
                      quantity >= baseTierSeats ? "#F9FAFB" : "#EEF2FF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color:
                        quantity >= baseTierSeats ? "#9CA3AF" : "#4F46E5",
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price summary */}
            <View
              style={{
                paddingVertical: 8,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: "#E5E7EB",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 13, color: "#6B7280" }}>
                  Price per ticket
                </Text>
                <Text style={{ fontSize: 13, color: "#111827" }}>
                  PHP {baseTierPrice.toLocaleString("en-PH")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Total ({quantity} ticket{quantity === 1 ? "" : "s"})
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#2563EB",
                  }}
                >
                  PHP {totalPrice.toLocaleString("en-PH")}
                </Text>
              </View>
            </View>

            {/* Modal buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  backgroundColor: "#FFFFFF",
                }}
                onPress={() => setShowCheckoutModal(false)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#374151",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 999,
                  backgroundColor: "#2563EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
                onPress={handleConfirmPurchase}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                    fontWeight: "600",
                  }}
                >
                  Confirm purchase
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PurchaseScreen;

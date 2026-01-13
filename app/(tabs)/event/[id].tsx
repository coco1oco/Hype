import React from "react";
import {
  Image,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Ticket } from "lucide-react-native";

import { FavoritesContext } from "../../../context/FavoritesContext";
import { supabase } from "../../../lib/supabase";

const fallbackImage = require("../../../assets/twice.jpg");

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();

  const [event, setEvent] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("loadEvent error", error);
        setEvent(null);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    loadEvent();
  }, [id]);

  const { saved, toggleSave } = React.useContext(FavoritesContext);

  // Must be computed unconditionally (hooks cannot be after early returns).
  const eventIdForHype = String(event?.id ?? id ?? "");
  const hypeScore = React.useMemo(() => {
    const min = 60;
    const max = 99;
    if (!eventIdForHype) return 80;

    const raw = eventIdForHype
      .split("")
      .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    const rand = (Math.sin(raw) + 1) / 2; // 0–1
    return Math.floor(rand * (max - min + 1)) + min;
  }, [eventIdForHype]);

  const hypeViews = React.useMemo(() => {
    const min = 500;
    const max = 5000;
    if (!eventIdForHype) return 1200;

    const raw = eventIdForHype
      .split("")
      .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0) * 7, 0);
    const rand = (Math.sin(raw + 42) + 1) / 2; // 0–1
    return Math.floor(rand * (max - min + 1)) + min;
  }, [eventIdForHype]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading event…</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const isSaved = saved.some((e: any) => e?.id === event.id);

  const eventTitle = event.name || event.title;
  const dateTime = new Date(event.date || event.start_time).toLocaleString(
    "en-PH",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
  const venue =
    event.location ||
    `${event.venue ?? ""}${event.city ? `, ${event.city}` : ""}`;

  const openInGoogleMaps = () => {
    const query = encodeURIComponent(venue);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const handlePurchase = () => {
    router.push(`/purchase/${encodeURIComponent(String(event.id))}`);
  };

  const tags: string[] = (
    event.tags && event.tags.length > 0
      ? event.tags
      : [event.city || event.location]
  )
    .filter((t: any) => typeof t === "string" && t.trim().length > 0)
    .map((t: string) => t.trim());

  const featuredHero =
    Array.isArray(event.featured_images) &&
    event.featured_images.length > 0 &&
    typeof event.featured_images[0] === "string"
      ? { uri: event.featured_images[0] as string }
      : undefined;

  const heroSource = featuredHero ?? fallbackImage;

  const hypeBuyers = Math.floor(hypeScore * 10);
  const hypeRecency = `${hypeScore}%`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f7" }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 32,
        }}
      >
        {/* Hero header */}
        <ImageBackground
          source={heroSource}
          style={{ width: "100%", height: 260 }}
          resizeMode="cover"
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingTop: 12,
              justifyContent: "space-between",
            }}
          >
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.55)",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>←</Text>
              <Text
                style={{
                  color: "#fff",
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Back
              </Text>
            </TouchableOpacity>

            {/* Title + meta */}
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Event · {event.city || event.location}
              </Text>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "800",
                  marginBottom: 8,
                }}
              >
                {eventTitle}
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                {dateTime}
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                }}
              >
                {venue}
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Main body */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* About this event */}
          <Card>
            <Text style={styles.cardTitle}>About This Event</Text>
            <Text style={styles.cardBody}>
              {event.description
                ? event.description
                : `${eventTitle} at ${venue}.`}
            </Text>
          </Card>

          {/* Event details */}
          <Card>
            <Text style={styles.cardTitle}>Event Details</Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <DetailRow label="Date & Time" value={dateTime} />
                <DetailRow
                  label="Location"
                  value={event.city || event.location}
                />
                <DetailRow
                  label="Accessibility"
                  value="✓ Wheelchair accessible"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: 8 }}>
                <DetailRow label="Venue" value={venue} />
                <DetailRow label="Venue Type" value="indoor" />
                <DetailRow label="Organizer" value="Live Nation Philippines" />
              </View>
            </View>

            <TouchableOpacity
              style={{
                marginTop: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isSaved ? "#007AFF" : "#E5E5EA",
                alignItems: "center",
                backgroundColor: isSaved ? "#E5F0FF" : "#fff",
              }}
              onPress={() => toggleSave(event as any)}
            >
              <Text
                style={{
                  color: "#007AFF",
                  fontWeight: "600",
                }}
              >
                {isSaved ? "Saved" : "Save this Venue"}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Location + map placeholder */}
          <Card>
            <Text style={styles.cardTitle}>Location</Text>

            <TouchableOpacity
              onPress={openInGoogleMaps}
              activeOpacity={0.8}
              style={{
                height: 220,
                borderRadius: 16,
                overflow: "hidden",
                marginTop: 12,
              }}
            >
              <Image
                source={require("../../../assets/static-map.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 10,
                alignSelf: "center",
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              onPress={openInGoogleMaps}
            >
              <Text style={{ color: "#007AFF", fontWeight: "500" }}>
                Open in Google Maps
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Plan & Essentials */}
          <Card>
            <Text style={styles.cardTitle}>Plan & Essentials</Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              <PrimaryButton
                label="Add to Calendar"
                icon={Calendar}
                flex={1}
                style={{ marginRight: 6 }}
              />
              <SecondaryButton
                label="Purchase Tickets"
                icon={Ticket}
                flex={1}
                style={{ marginLeft: 6 }}
                onPress={handlePurchase}
              />
            </View>

            <InfoStrip
              title="Doors open"
              body="Arena doors open 90 minutes before showtime. Have your QR pass ready."
            />
            <InfoStrip
              title="Bag policy"
              body="Clear bags only. No professional cameras, tripods, or large power banks."
            />
            <InfoStrip
              title="Travel tips"
              body="Expect heavy traffic; plan extra travel time."
            />
          </Card>

          {/* Tags */}
          <Card>
            <Text style={styles.cardTitle}>Tags</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              {tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: "#F2F2F7",
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#1C1C1E",
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Hype Score (randomized) */}
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={styles.cardTitle}>Hype Score</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#FF3B30",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Trending
              </Text>
            </View>

            <View
              style={{
                height: 6,
                borderRadius: 999,
                backgroundColor: "#E5E5EA",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: `${hypeScore}%`,
                  height: "100%",
                  backgroundColor: "#FF3B30",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <MetricColumn label="VIEWS" value={hypeViews.toLocaleString()} />
              <MetricColumn label="BUYERS" value={hypeBuyers.toString()} />
              <MetricColumn label="RECENCY" value={hypeRecency} />
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#1C1C1E",
                  }}
                >
                  {hypeScore}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: "#3C3C43",
    lineHeight: 18,
    marginTop: 4,
  },
} as const;

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }}
  >
    {children}
  </View>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={{ marginBottom: 10 }}>
    <Text
      style={{
        fontSize: 11,
        color: "rgba(60,60,67,0.6)",
        textTransform: "uppercase",
        marginBottom: 2,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: 13,
        color: "#1C1C1E",
      }}
    >
      {value}
    </Text>
  </View>
);

const PrimaryButton: React.FC<{
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  flex?: number;
  style?: any;
}> = ({ label, icon: IconComp, flex = 0, style }) => (
  <View style={[{ flex }, style]}>
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        borderRadius: 999,
        paddingVertical: 10,
      }}
      activeOpacity={0.85}
    >
      {IconComp ? (
        <View style={{ marginRight: 8 }}>
          <IconComp size={16} color="#fff" />
        </View>
      ) : null}
      <Text
        style={{
          color: "#fff",
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);

const SecondaryButton: React.FC<{
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  flex?: number;
  style?: any;
  onPress?: () => void;
}> = ({ label, icon: IconComp, flex = 0, style, onPress }) => (
  <View style={[{ flex }, style]}>
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        backgroundColor: "#fff",
      }}
      activeOpacity={0.85}
    >
      {IconComp ? (
        <View style={{ marginRight: 8 }}>
          <IconComp size={16} color="#1C1C1E" />
        </View>
      ) : null}
      <Text
        style={{
          color: "#1C1C1E",
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);

const InfoStrip: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <View
    style={{
      backgroundColor: "#F8F8FA",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 8,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: "#1C1C1E",
        marginBottom: 2,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: "#3C3C43",
      }}
    >
      {body}
    </Text>
  </View>
);

const MetricColumn: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={{ alignItems: "flex-start" }}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#1C1C1E",
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontSize: 10,
        color: "rgba(60,60,67,0.6)",
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  </View>
);

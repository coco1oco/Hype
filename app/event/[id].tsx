import React from "react";
import { Image } from "react-native";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Home, Heart, Ticket } from "lucide-react-native";

import { supabase } from "../../lib/supabase";
import { FavoritesContext } from "../../context/FavoritesContext";

type Tab = {
  key: "home" | "saved" | "tickets" | "scan";
  label: string;
  icon: React.ComponentType<any>;
  href: string;
};

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home, href: "/event" },
  { key: "saved", label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets", label: "Tickets", icon: Ticket, href: "/tickets" },
];

const fallbackImage = require("../../assets/twice.jpg");

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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

  const isSaved = saved.some((e) => e.id === event.id);

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
    router.push({
      pathname: "/purchase/[id]",
      params: { id: event.id },
    } as any);
  };

  // Build safe tags array with unique keys (drop category since column is not in table)
  const tags: string[] = (
    event.tags && event.tags.length > 0
      ? event.tags
      : [event.city || event.location]
  )
    .filter((t: any) => typeof t === "string" && t.trim().length > 0)
    .map((t: string) => t.trim());

  // hero image: prefer first featured_images URL, else fallback
  const featuredHero =
    Array.isArray(event.featured_images) &&
    event.featured_images.length > 0 &&
    typeof event.featured_images[0] === "string"
      ? { uri: event.featured_images[0] as string }
      : undefined;

  const heroSource = featuredHero ?? fallbackImage;

  // ---------- randomized hype score (local only) ----------
  const hypeScore = React.useMemo(() => {
    const min = 60;
    const max = 99;
    const raw = String(event.id || "")
      .split("")
      .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    const rand = (Math.sin(raw) + 1) / 2; // 0–1
    return Math.floor(rand * (max - min + 1)) + min;
  }, [event.id]);

  const hypeViews = React.useMemo(() => {
    const min = 500;
    const max = 5000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

  const hypeBuyers = Math.floor(hypeScore * 10);
  const hypeRecency = `${hypeScore}%`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f7" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
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
                  <DetailRow
                    label="Organizer"
                    value="Live Nation Philippines"
                  />
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
                onPress={() => toggleSave(event)}
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
                  source={require("../../assets/static-map.png")}
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
                  icon="📅"
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
                <MetricColumn
                  label="VIEWS"
                  value={hypeViews.toLocaleString()}
                />
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

        {/* Bottom nav */}
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
                    onPress={() => router.push(href as any)}
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
  icon?: string;
  flex?: number;
  style?: any;
}> = ({ label, icon, flex = 0, style }) => (
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
    >
      {icon && (
        <Text style={{ color: "#fff", marginRight: 8, fontSize: 14 }}>
          {icon}
        </Text>
      )}
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
    >
      {IconComp && (
        <View style={{ marginRight: 8 }}>
          <IconComp size={16} color="#1C1C1E" />
        </View>
      )}
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

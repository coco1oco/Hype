// app/event/[id].tsx
import { events } from "../../data/events";
import { FavoritesContext } from "../../context/FavoritesContext";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { Home, Heart, Ticket, QrCode } from "lucide-react-native";

type Tab = {
  key: "home" | "saved" | "tickets" | "scan";
  label: string;
  icon: React.ComponentType<any>;
  href: string; // loosen type
};

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "saved", label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets", label: "Tickets", icon: Ticket, href: "/tickets" },
  { key: "scan", label: "Scan", icon: QrCode, href: "/scan" }, // can add later
];

const coverMap: Record<string, any> = {
  "/twice.jpg": require("../../assets/twice.jpg"),
  "/blackpink.jpg": require("../../assets/blackpink.jpg"),
  "/tyla.jpg": require("../../assets/tyla.jpg"),
  "/day6.jpg": require("../../assets/day6.jpg"),
  "/ham.jpg": require("../../assets/ham.jpg"),
  "/cs.png": require("../../assets/cs.png"),
  "/cvsu.jpg": require("../../assets/cvsu.jpg"),
};


export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const { saved, toggleSave } = React.useContext(FavoritesContext);
const isSaved = saved.some((e) => e.id === event.id);

  const eventTitle = event.title;
  const dateTime = new Date(event.startTime).toLocaleString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const venue = `${event.venue}, ${event.city}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f7" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          {/* Hero header */}
                  {/* Hero header */}
        <ImageBackground
          source={
            coverMap[event.cover] ??
            (event.cover.startsWith("http")
              ? { uri: event.cover }
              : require("../../assets/twice.jpg"))
          }
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
    {event.category} · {event.city}
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
                : `${event.title} at ${event.venue} in ${event.city}.`}
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
      <DetailRow
        label="Date & Time"
        value={dateTime}               // ← use computed dateTime
      />
      <DetailRow
        label="Location"
        value={event.city}             // ← from event
      />
      <DetailRow
        label="Accessibility"
        value="✓ Wheelchair accessible"
      />
    </View>
    <View style={{ flex: 1, paddingLeft: 8 }}>
      <DetailRow
        label="Venue"
        value={event.venue}            // ← from event
      />
      <DetailRow
        label="Venue Type"
        value="indoor"
      />
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
      color: isSaved ? "#007AFF" : "#007AFF",
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
              <View
                style={{
                  height: 220,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginTop: 12,
                  backgroundColor: "#e5e5ea",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#3C3C43" }}>Map goes here</Text>
              </View>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  alignSelf: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
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
                  label="Apple Wallet"
                  icon=""
                  flex={1}
                  style={{ marginLeft: 6 }}
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
                body="Taguig • AWS Manila Office & Virtual. Expect heavy traffic; plan extra travel time."
              />
            </Card>

            {/* Tags */}
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
    {(event.tags && event.tags.length > 0
      ? event.tags
      : [event.category, event.city]
    ).map((tag) => (
      <View
        key={tag}
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


            {/* Hype Score */}
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
                    width: "87%",
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
                <MetricColumn label="VIEWS" value="2,602" />
                <MetricColumn label="BUYERS" value="900" />
                <MetricColumn label="RECENCY" value="88%" />
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#1C1C1E",
                    }}
                  >
                    87
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>

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
    const isActive = key === "tickets"; // tickets active on detail

    return (
      <TouchableOpacity
        key={key}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.8}
        onPress={() => router.push(href as any)} // cast fixes TS complaint
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
        borderRadius: 999,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        backgroundColor: "#fff",
      }}
    >
      {icon && (
        <Text style={{ marginRight: 8, fontSize: 14, color: "#1C1C1E" }}>
          {icon}
        </Text>
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


import React from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Home, Search, Ticket, User, Heart, QrCode } from "lucide-react-native";

import { events, filterEvents } from "../../data/events";

type TabKey = "home" | "search" | "tickets" | "profile";


const tabs = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "saved", label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets", label: "Tickets", icon: Ticket, href: "/tickets" },
  { key: "scan", label: "Scan", icon: QrCode, href: "/scan" },
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

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // ---------- state ----------
  const [search, setSearch] = React.useState("");
  const [category, setCategory] =
    React.useState<"all" | "Trending" | "Fan Favorite" | "Chill" | "Niche">(
      "all"
    );
  const [date, setDate] = React.useState<string | null>(null); // "yyyy-mm-dd"
  const [location, setLocation] = React.useState("");
  const [filtered, setFiltered] = React.useState(events);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"home" | "search" | "tickets" | "profile">("home");
  

  // ---------- filtering ----------
  React.useEffect(() => {
  const next = filterEvents({ category, search, date: date ?? undefined, location });
  console.log("filters:", { date, count: next.length });
  setFiltered(next);
}, [category, search, date, location]);

  // ---------- UI ----------
  return (
    <LinearGradient
      colors={["#020617", "#0b1220", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: isWide ? 48 : 16,
            paddingTop: 16,
            paddingBottom: 96,
            alignItems: "center",
          }}
        >
          <View style={{ width: "100%", maxWidth: 900 }}>
            {/* Top row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 18 }}
                >
                  h
                </Text>
              </View>

              <TouchableOpacity
              style={{
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
              onPress={() => {
                // optionally clear auth/session here, then:
                router.replace("/(auth)/login"); // or "/login" if that is your path
              }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
              >
                Log out
              </Text>
            </TouchableOpacity>

            </View>

            {/* Title */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: isWide ? 64 : 52,
                  fontWeight: "800",
                  color: "#fff",
                  letterSpacing: 0.5,
                  textAlign: "center",
                }}
              >
                hype
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: isWide ? 16 : 14,
                  textAlign: "center",
                }}
              >
                Second-hand tickets, zero second thoughts.
              </Text>
            </View>

            {/* Search card */}
            <View
              style={{
                backgroundColor: "#F2F2F7",
                borderRadius: 24,
                padding: isWide ? 16 : 14,
                marginBottom: 16,
                width: "100%",
              }}
            >
              {/* search */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                }}
              >
                <TextInput
                  placeholder="Search events..."
                  placeholderTextColor="#8E8E93"
                  value={search}
                  onChangeText={setSearch}
                  style={{
                    fontSize: 14,
                    color: "#000",
                  }}
                />
              </View>

              {/* category (simple toggle for now) */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onPress={() =>
                  setCategory((prev) =>
                    prev === "all" ? "Trending" : "all"
                  )
                }
              >
                <Text style={{ fontSize: 14, color: "#3C3C43" }}>
                  {category === "all" ? "All Categories" : category}
                </Text>
                <Text style={{ fontSize: 14, color: "#3C3C43" }}>˅</Text>
              </TouchableOpacity>

              {/* date */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: date ? "#000" : "#8E8E93",
                    }}
                  >
                    {date
                      ? new Date(date).toLocaleDateString("en-GB")
                      : "dd/mm/yyyy"}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: "#3C3C43" }}>📅</Text>
              </View>

              {/* location */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                }}
              >
                <TextInput
                  placeholder="Location..."
                  placeholderTextColor="#8E8E93"
                  value={location}
                  onChangeText={setLocation}
                  style={{ fontSize: 14, color: "#000" }}
                />
              </View>
            </View>

            {/* Event cards */}
<View style={{ marginTop: 12 }}>
  {filtered.map((event) => (
    <TouchableOpacity
      key={event.id}
      activeOpacity={0.9}
      onPress={() =>
        router.push({ pathname: "/event/[id]", params: { id: event.id } })
      }
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <View style={{ height: 210 }}>
        <Image
  source={
    coverMap[event.cover] ??
    (event.cover.startsWith("http")
      ? { uri: event.cover }
      : coverMap["/twice.jpg"])
  }
  style={{ width: "100%", height: "100%" }}
  resizeMode="cover"
/>


        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0,0,0,0.72)",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
              marginBottom: 2,
            }}
          >
            {event.category === "Fan Favorite" ? "Fan Favorite" : "Trending"}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            {event.hypeScore}
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            right: 16,
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {event.title}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text
          style={{
            fontSize: 12,
            color: "#3C3C43",
            marginBottom: 4,
          }}
        >
          {event.city} ·{" "}
          {new Date(event.startTime).toLocaleString("en-PH", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>

        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: "#000",
            marginBottom: 4,
          }}
        >
          {event.venue}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(60,60,67,0.6)",
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {event.tags.join(" · ")}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "rgba(60,60,67,0.8)",
              textTransform: "uppercase",
              marginRight: 4,
              textAlign: "right",
            }}
          >
            From{" "}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#007AFF",
              }}
            >
              {event.tiers[0].currency}{" "}
              {event.tiers[0].price.toLocaleString("en-PH")}
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ))}
</View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) {
                const y = selected.getFullYear();
                const m = String(selected.getMonth() + 1).padStart(2, "0");
                const d = String(selected.getDate()).padStart(2, "0");
                setDate(`${y}-${m}-${d}`);
              }
            }}
          />
        )}

        

        {/* Bottom tab bar */}
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
      paddingHorizontal: isWide ? 48 : 24,
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
  const isActive = key === "home"; // home active on index

  return (
    <TouchableOpacity
      key={key}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
      onPress={() => router.push(href as any)} // ← add `as any` or `as Href`
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
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
// app/event/index.tsx (HomeScreen)
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
import { Home, Ticket, Heart } from "lucide-react-native";

import { supabase } from "../../lib/supabase";

type TabKey = "home" | "search" | "tickets" | "profile";

const tabs = [
  { key: "home" as TabKey, label: "Home", icon: Home, href: "/event" },
  { key: "saved" as TabKey, label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets" as TabKey, label: "Tickets", icon: Ticket, href: "/tickets" },
];

const fallbackImage = require("../../assets/twice.jpg");

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // ---------- auth / user ----------
  const [session, setSession] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<{
    full_name?: string | null;
    role?: string | null;
    favorite_city?: string | null;
  } | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const currentSession = data.session;
      setSession(currentSession);

      if (!currentSession?.user) {
        setLoadingUser(false);
        router.replace("/(auth)/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, favorite_city")
        .eq("id", currentSession.user.id)
        .single();

      if (mounted) {
        setProfile(profileData ?? {});
        setLoadingUser(false);
      }
    };

    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (!newSession?.user) {
          router.replace("/(auth)/login");
        }
      }
    );

    return () => {
      mounted = false;
      authSub?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  const displayName =
    profile?.full_name ||
    session?.user?.email?.split("@")[0] ||
    "Guest";

  const userRole = profile?.role || "buyer";

  // ---------- events from Supabase ----------
  const [events, setEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  React.useEffect(() => {
    const loadApprovedEvents = async () => {
      setLoadingEvents(true);

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          id,
          name,
          date,
          location,
          description,
          featured_images,
          tier_price,
          tier_seats
        `
        )
        .eq("status", "approved")
        .order("date", { ascending: true });

      if (error) {
        console.error("events load error", error);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoadingEvents(false);
    };

    loadApprovedEvents();
  }, []);

  // ---------- filters ----------
  const [search, setSearch] = React.useState("");
  const [date, setDate] = React.useState<string | null>(null); // "yyyy-mm-dd"
  const [location, setLocation] = React.useState("");
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [activeTab] = React.useState<TabKey>("home");

  const effectiveLocation = location || profile?.favorite_city || "";
  const filtered = events.filter((ev) => {
    const text = (ev.name || "").toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;

    if (date) {
      const evDate = new Date(ev.date).toISOString().slice(0, 10);
      if (evDate !== date) return false;
    }

    if (effectiveLocation) {
      const loc = (ev.location || "").toLowerCase();
      if (!loc.includes(effectiveLocation.toLowerCase())) return false;
    }

    return true;
  });

  if (loadingUser) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#020617",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Loading your dashboard…</Text>
      </View>
    );
  }

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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  <Image
                    source={require("../../assets/hype1.png")}
                    style={{ width: 32, height: 32, resizeMode: "contain" }}
                  />
                </View>

                <View>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 11,
                      textTransform: "uppercase",
                    }}
                  >
                    {userRole === "admin" ? "Admin" : "Buyer"}
                  </Text>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {displayName}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.16)",
                }}
                onPress={handleLogout}
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
                Hype
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: isWide ? 16 : 14,
                  textAlign: "center",
                }}
              >
                Turn every ticket into a sold-out moment.
              </Text>
              {profile?.favorite_city && (
                <Text
                  style={{
                    marginTop: 4,
                    color: "#A5B4FC",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  Showing events near {profile.favorite_city}.
                </Text>
              )}
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

              {/* static category label */}
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
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "#3C3C43" }}>
                  All events
                </Text>
                <Text style={{ fontSize: 14, color: "#3C3C43" }}>˅</Text>
              </View>

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
                  placeholder={
                    profile?.favorite_city
                      ? `Location... (e.g. ${profile.favorite_city})`
                      : "Location..."
                  }
                  placeholderTextColor="#8E8E93"
                  value={location}
                  onChangeText={setLocation}
                  style={{ fontSize: 14, color: "#000" }}
                />
              </View>
            </View>

            {/* Event cards */}
            <View style={{ marginTop: 12 }}>
              {loadingEvents ? (
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 16,
                  }}
                >
                  Loading events…
                </Text>
              ) : filtered.length === 0 ? (
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 16,
                  }}
                >
                  No events available yet.
                </Text>
              ) : (
                filtered.map((event) => {
                  const featured =
                    Array.isArray(event.featured_images) &&
                    event.featured_images.length > 0
                      ? { uri: event.featured_images[0] as string }
                      : undefined;

                  const coverSource = featured ?? fallbackImage;

                  return (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push({
                          pathname: "/event/[id]",
                          params: { id: event.id },
                        } as any)
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
                          source={coverSource}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />

                        {/* simple pill, no hypeScore */}
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
                            }}
                          >
                            Featured
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
                            {event.name}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#3C3C43",
                            marginBottom: 4,
                          }}
                        >
                          {event.location} ·{" "}
                          {new Date(event.date).toLocaleString("en-PH", {
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
                          {event.location}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
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
                const isActive = key === activeTab;

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
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;

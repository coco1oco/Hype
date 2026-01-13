// app/(tabs)/event/index.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { supabase } from "../../../lib/supabase";

const fallbackImage = require("../../../assets/twice.jpg");

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toLocalDateKey(input: unknown): string | null {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    // Support common non-ISO date strings like dd/mm/yyyy or mm/dd/yyyy.
    const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      const a = Number(slash[1]);
      const b = Number(slash[2]);
      const y = Number(slash[3]);

      const day = a > 12 ? a : b > 12 ? b : a;
      const month = a > 12 ? b : b > 12 ? a : b;

      if (y && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const d = new Date(y, month - 1, day);
        return toLocalDateKey(d);
      }
    }

    const ymdSlash = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymdSlash) {
      const y = Number(ymdSlash[1]);
      const m = Number(ymdSlash[2]);
      const d = Number(ymdSlash[3]);
      if (y && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
      }
    }
  }

  const d = input instanceof Date ? input : new Date(String(input ?? ""));
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateKeyForDisplay(dateKey: string) {
  // Keep it predictable and timezone-safe.
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}

type EventCategory = "Trending" | "Fan Favorite" | "Chill" | "Niche";
type CategoryFilter = "All" | EventCategory;

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "All",
  "Trending",
  "Fan Favorite",
  "Chill",
  "Niche",
];

function getNumeric(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getCapacityEstimate(ev: any) {
  const seats = ev?.tier_seats;
  if (Array.isArray(seats)) {
    return seats.reduce((sum, v) => sum + getNumeric(v), 0);
  }
  return getNumeric(seats);
}

function getPriceEstimate(ev: any) {
  const price = ev?.tier_price;
  if (Array.isArray(price)) {
    const nums = price.map(getNumeric).filter((n) => n > 0);
    return nums.length ? Math.max(...nums) : 0;
  }
  return getNumeric(price);
}

function getPriceMin(ev: any) {
  const price = ev?.tier_price;
  if (Array.isArray(price)) {
    const nums = price.map(getNumeric).filter((n) => n > 0);
    return nums.length ? Math.min(...nums) : 0;
  }
  return getNumeric(price);
}

function formatPHP(amount: number) {
  if (!amount || !Number.isFinite(amount)) return null;
  return `₱${amount.toLocaleString("en-PH")}`;
}

function formatEventDateTime(value: unknown) {
  const d = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(d.getTime())) return "TBA";
  return d.toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function classifyEventCategory(ev: any): EventCategory {
  const text = normalizeText(
    `${ev?.name ?? ""} ${ev?.description ?? ""} ${ev?.location ?? ""}`
  );

  const capacity = getCapacityEstimate(ev);
  const price = getPriceEstimate(ev);

  const chillKeywords = [
    "acoustic",
    "lounge",
    "chill",
    "coffee",
    "sunset",
    "rooftop",
    "vinyl",
    "intimate",
    "ambient",
    "jazz",
  ];
  if (chillKeywords.some((k) => text.includes(k))) return "Chill";

  const trendingKeywords = [
    "world tour",
    "tour",
    "festival",
    "arena",
    "stadium",
    "sold out",
    "headline",
  ];
  if (capacity >= 5000 || trendingKeywords.some((k) => text.includes(k))) {
    return "Trending";
  }

  const fanKeywords = [
    "anniversary",
    "encore",
    "finale",
    "comeback",
    "reunion",
    "special",
  ];
  if (capacity >= 1500 || fanKeywords.some((k) => text.includes(k))) {
    return "Fan Favorite";
  }

  // Smaller capacity, niche communities, or premium small-room events.
  if (capacity > 0 && capacity <= 800) return "Niche";
  if (price >= 8000 && capacity > 0 && capacity < 1500) return "Niche";

  return "Niche";
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const tabBarHeight = useBottomTabBarHeight();

  // ---------- focus animation (runs when switching tabs) ----------
  const isFocused = useIsFocused();
  const focusProgress = useSharedValue(0);

  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: isFocused ? 320 : 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, focusProgress]);

  const focusStyle = useAnimatedStyle(() => {
    return {
      opacity: focusProgress.value,
      transform: [{ translateY: (1 - focusProgress.value) * 10 }],
    };
  });

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
    profile?.full_name || session?.user?.email?.split("@")[0] || "Guest";

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
  const [category, setCategory] = React.useState<CategoryFilter>("All");
  const [date, setDate] = React.useState<string | null>(null); // "yyyy-mm-dd"
  const [location, setLocation] = React.useState("");
  const [showCalendar, setShowCalendar] = React.useState(false);

  const hasAnyFilter = Boolean(
    search.trim() || location.trim() || date || category !== "All"
  );
  const clearAllFilters = React.useCallback(() => {
    setSearch("");
    setCategory("All");
    setLocation("");
    setDate(null);
  }, []);

  const effectiveLocation =
    location.trim() || profile?.favorite_city?.trim() || "";
  const filteredWithoutDate = React.useMemo(() => {
    const searchNeedle = normalizeText(search);
    const locationNeedle = normalizeText(effectiveLocation);

    return events.filter((ev) => {
      const haystack = normalizeText(
        `${ev.name ?? ""} ${ev.location ?? ""} ${ev.description ?? ""}`
      );
      if (searchNeedle && !haystack.includes(searchNeedle)) return false;

      if (category !== "All") {
        const evCategory = classifyEventCategory(ev);
        if (evCategory !== category) return false;
      }

      if (locationNeedle) {
        const loc = normalizeText(ev.location);
        if (!loc.includes(locationNeedle)) return false;
      }

      return true;
    });
  }, [category, effectiveLocation, events, search]);

  const filtered = React.useMemo(() => {
    if (!date) return filteredWithoutDate;
    return filteredWithoutDate.filter((ev) => {
      const evDateKey = toLocalDateKey(ev.date);
      return Boolean(evDateKey && evDateKey === date);
    });
  }, [date, filteredWithoutDate]);

  const markedDates = React.useMemo(() => {
    const marks: Record<string, any> = {};
    for (const ev of filteredWithoutDate) {
      const key = toLocalDateKey(ev?.date);
      if (!key) continue;
      marks[key] = {
        ...(marks[key] ?? {}),
        marked: true,
        dotColor: "#111827",
      };
    }

    if (date) {
      marks[date] = {
        ...(marks[date] ?? {}),
        selected: true,
        selectedColor: "#111827",
        selectedTextColor: "#fff",
        marked: true,
        dotColor: "#fff",
      };
    }

    return marks;
  }, [date, filteredWithoutDate]);

  const selectedDayCount = React.useMemo(() => {
    if (!date) return 0;
    return filteredWithoutDate.reduce((count, ev) => {
      const key = toLocalDateKey(ev?.date);
      return count + (key === date ? 1 : 0);
    }, 0);
  }, [date, filteredWithoutDate]);

  const showingProfileCity =
    !location.trim() && Boolean(profile?.favorite_city?.trim());

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
        <Animated.View style={[{ flex: 1 }, focusStyle]}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: isWide ? 48 : 16,
              paddingTop: 16,
              paddingBottom: tabBarHeight + 32,
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
                      source={require("../../../assets/hype1.png")}
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#3C3C43",
                      fontWeight: "700",
                      letterSpacing: 0.2,
                    }}
                  >
                    Filters
                  </Text>
                  <TouchableOpacity
                    onPress={clearAllFilters}
                    disabled={!hasAnyFilter}
                    activeOpacity={0.8}
                    style={{
                      opacity: hasAnyFilter ? 1 : 0.4,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#E5E5EA",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#111827" }}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>

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

                {/* categories */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 2,
                    gap: 8,
                    paddingBottom: 8,
                  }}
                  style={{ marginBottom: 8 }}
                >
                  {CATEGORY_OPTIONS.map((opt) => {
                    const active = category === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.85}
                        onPress={() => setCategory(opt)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: active ? "#111827" : "#fff",
                          borderWidth: 1,
                          borderColor: active ? "#111827" : "#E5E5EA",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: active ? "#fff" : "#111827",
                          }}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

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
                    onPress={() => setShowCalendar(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: date ? "#000" : "#8E8E93",
                      }}
                    >
                      {date ? formatDateKeyForDisplay(date) : "dd/mm/yyyy"}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {date ? (
                      <TouchableOpacity
                        onPress={() => setDate(null)}
                        activeOpacity={0.8}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 6,
                        }}
                      >
                        <X size={16} color="#6B7280" />
                      </TouchableOpacity>
                    ) : null}
                    <CalendarIcon size={18} color="#3C3C43" />
                  </View>
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
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MapPin
                    size={16}
                    color="#3C3C43"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder={
                      profile?.favorite_city
                        ? `Location... (e.g. ${profile.favorite_city})`
                        : "Location..."
                    }
                    placeholderTextColor="#8E8E93"
                    value={location}
                    onChangeText={setLocation}
                    style={{ flex: 1, fontSize: 14, color: "#000" }}
                  />
                  {location.trim() ? (
                    <TouchableOpacity
                      onPress={() => setLocation("")}
                      activeOpacity={0.8}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 6,
                      }}
                    >
                      <X size={16} color="#6B7280" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {(hasAnyFilter || showingProfileCity) && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                      paddingHorizontal: 2,
                    }}
                  >
                    {search.trim() ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#E5E5EA",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#111827" }}>
                          Search: {search.trim()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSearch("")}
                          activeOpacity={0.8}
                          style={{ marginLeft: 8 }}
                        >
                          <X size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {category !== "All" ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#E5E5EA",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#111827" }}>
                          Category: {category}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setCategory("All")}
                          activeOpacity={0.8}
                          style={{ marginLeft: 8 }}
                        >
                          <X size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {date ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#E5E5EA",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#111827" }}>
                          Date: {formatDateKeyForDisplay(date)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setDate(null)}
                          activeOpacity={0.8}
                          style={{ marginLeft: 8 }}
                        >
                          <X size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {effectiveLocation ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#E5E5EA",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#111827" }}>
                          Near: {effectiveLocation}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setLocation("")}
                          activeOpacity={0.8}
                          style={{ marginLeft: 8 }}
                        >
                          <X size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 12 }}>
                  {loadingEvents
                    ? "Loading…"
                    : `${filtered.length} event${
                        filtered.length === 1 ? "" : "s"
                      }`}
                </Text>
              </View>

              {/* Event cards */}
              <View
                style={{
                  marginTop: 12,
                  flexDirection: isWide ? "row" : "column",
                  flexWrap: isWide ? "wrap" : "nowrap",
                  justifyContent: isWide ? "space-between" : "flex-start",
                }}
              >
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
                  <View style={{ alignItems: "center", marginTop: 16 }}>
                    <Text
                      style={{
                        color: "#E5E7EB",
                        fontSize: 14,
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      No matches
                    </Text>
                    <Text
                      style={{
                        color: "rgba(229,231,235,0.8)",
                        fontSize: 13,
                        textAlign: "center",
                        marginTop: 6,
                        maxWidth: 340,
                      }}
                    >
                      Try adjusting your date or location filters.
                    </Text>
                    {hasAnyFilter ? (
                      <TouchableOpacity
                        onPress={clearAllFilters}
                        activeOpacity={0.85}
                        style={{
                          marginTop: 12,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 999,
                          backgroundColor: "rgba(255,255,255,0.16)",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          Clear filters
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : (
                  filtered.map((event) => {
                    const eventCategory = classifyEventCategory(event);
                    const featured =
                      Array.isArray(event.featured_images) &&
                      event.featured_images.length > 0
                        ? { uri: event.featured_images[0] as string }
                        : undefined;

                    const isFeatured = Boolean(featured);
                    const priceMin = getPriceMin(event);
                    const priceMax = getPriceEstimate(event);
                    const capacity = getCapacityEstimate(event);
                    const priceLabel =
                      priceMin && priceMax && priceMin !== priceMax
                        ? `${formatPHP(priceMin)}–${formatPHP(priceMax)}`
                        : formatPHP(priceMax || priceMin);

                    const coverSource = featured ?? fallbackImage;

                    return (
                      <TouchableOpacity
                        key={event.id}
                        activeOpacity={0.9}
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/event/[id]",
                            params: { id: String(event.id) },
                          })
                        }
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: 24,
                          overflow: "hidden",
                          marginBottom: 16,
                          width: isWide ? "48.5%" : "100%",
                          shadowColor: "#000",
                          shadowOpacity: 0.08,
                          shadowRadius: 12,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 4,
                        }}
                      >
                        <View style={{ height: 220 }}>
                          <Image
                            source={coverSource}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />

                          {/* readability overlay */}
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.68)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                            }}
                          />

                          <View
                            style={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              flexDirection: "row",
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "rgba(0,0,0,0.70)",
                                borderRadius: 999,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "800",
                                  color: "rgba(255,255,255,0.92)",
                                }}
                              >
                                {eventCategory}
                              </Text>
                            </View>

                            {isFeatured ? (
                              <View
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.16)",
                                  borderRadius: 999,
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  borderWidth: 1,
                                  borderColor: "rgba(255,255,255,0.24)",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: "800",
                                    color: "rgba(255,255,255,0.92)",
                                  }}
                                >
                                  Featured
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View
                            style={{
                              position: "absolute",
                              left: 16,
                              bottom: 14,
                              right: 16,
                            }}
                          >
                            <Text
                              numberOfLines={2}
                              style={{
                                color: "#fff",
                                fontSize: 20,
                                fontWeight: "800",
                              }}
                            >
                              {event.name}
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 6,
                                justifyContent: "space-between",
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  flex: 1,
                                  color: "rgba(255,255,255,0.86)",
                                  fontSize: 12,
                                  marginRight: 10,
                                }}
                              >
                                {event.location}
                              </Text>

                              {priceLabel ? (
                                <View
                                  style={{
                                    backgroundColor: "rgba(255,255,255,0.16)",
                                    borderRadius: 999,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.22)",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#fff",
                                      fontSize: 12,
                                      fontWeight: "800",
                                    }}
                                  >
                                    {priceLabel}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </View>

                        <View
                          style={{ paddingHorizontal: 16, paddingVertical: 14 }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <MapPin size={14} color="#6B7280" />
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 12,
                                    color: "#374151",
                                  }}
                                >
                                  {event.location || "TBA"}
                                </Text>
                              </View>

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <CalendarIcon size={14} color="#6B7280" />
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 12,
                                    color: "#374151",
                                  }}
                                >
                                  {formatEventDateTime(event.date)}
                                </Text>
                              </View>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              {capacity ? (
                                <View
                                  style={{
                                    backgroundColor: "#F3F4F6",
                                    borderRadius: 999,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "800",
                                      color: "#111827",
                                    }}
                                  >
                                    {capacity.toLocaleString("en-PH")} seats
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          </View>

                          <Text
                            numberOfLines={2}
                            style={{ fontSize: 13, color: "#111827" }}
                          >
                            {event.description ||
                              "Tap to view details & tickets."}
                          </Text>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#6B7280",
                              }}
                            >
                              View details
                            </Text>
                            <ChevronRight size={18} color="#111827" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>

          <Modal
            transparent
            animationType="fade"
            visible={showCalendar}
            onRequestClose={() => setShowCalendar(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.55)",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              {/* Backdrop close */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowCalendar(false)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />

              <View
                style={{
                  width: "100%",
                  maxWidth: 520,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(17,24,39,0.10)",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#111827",
                      }}
                    >
                      Select a date
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                    >
                      Dots indicate days with events.
                    </Text>
                  </View>

                  {date ? (
                    <TouchableOpacity
                      onPress={() => setDate(null)}
                      activeOpacity={0.85}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "800",
                          color: "#111827",
                        }}
                      >
                        Clear date
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowCalendar(false)}
                      activeOpacity={0.85}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <X size={18} color="#111827" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ padding: 12 }}>
                  <Calendar
                    current={date ?? toLocalDateKey(new Date()) ?? undefined}
                    markedDates={markedDates}
                    onDayPress={(day) => {
                      setDate(day.dateString);
                      setShowCalendar(false);
                    }}
                    theme={{
                      backgroundColor: "#fff",
                      calendarBackground: "#fff",
                      textSectionTitleColor: "#6B7280",
                      selectedDayBackgroundColor: "#111827",
                      selectedDayTextColor: "#fff",
                      todayTextColor: "#111827",
                      dayTextColor: "#111827",
                      monthTextColor: "#111827",
                      arrowColor: "#111827",
                      textDisabledColor: "#D1D5DB",
                      dotColor: "#111827",
                      selectedDotColor: "#fff",
                    }}
                  />

                  {date ? (
                    <Text
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {selectedDayCount} event
                      {selectedDayCount === 1 ? "" : "s"} on{" "}
                      {formatDateKeyForDisplay(date)}
                    </Text>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowCalendar(false)}
                      activeOpacity={0.85}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 999,
                        backgroundColor: "#111827",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 12,
                        }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;

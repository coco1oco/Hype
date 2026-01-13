// app/(tabs)/saved.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Calendar, MapPin } from "lucide-react-native";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { FavoritesContext } from "../../context/FavoritesContext";

const fallbackImage = require("../../assets/twice.jpg");

function toText(value: unknown) {
  return String(value ?? "").trim();
}

function getSavedTitle(item: any) {
  return (
    toText(item?.name) ||
    toText(item?.title) ||
    toText(item?.event_name) ||
    "Saved event"
  );
}

function getSavedLocationLine(item: any) {
  const location = toText(item?.location);
  const venue = toText(item?.venue);
  const city = toText(item?.city);

  if (location) return location;
  if (venue && city) return `${venue}, ${city}`;
  return venue || city || "Location TBA";
}

function getSavedDateLine(item: any) {
  const raw = item?.date ?? item?.start_time ?? item?.created_at;
  const d = new Date(String(raw ?? ""));
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSavedImageSource(item: any) {
  const featured = item?.featured_images;
  if (Array.isArray(featured) && featured.length > 0) {
    const first = featured[0];
    if (typeof first === "string" && first.trim()) {
      return { uri: first };
    }
  }
  if (typeof item?.image === "string" && item.image.trim()) {
    return { uri: item.image };
  }
  return fallbackImage;
}

export default function SavedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const tabBarHeight = useBottomTabBarHeight();

  const { saved, toggleSave } = React.useContext(FavoritesContext);
  const savedCount = saved.length;

  // Focus animation
  const isFocused = useIsFocused();
  const focusProgress = useSharedValue(0);

  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: isFocused ? 280 : 140,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, focusProgress]);

  const focusStyle = useAnimatedStyle(() => {
    return {
      opacity: focusProgress.value,
      transform: [{ translateY: (1 - focusProgress.value) * 8 }],
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: tabBarHeight + 32,
            maxWidth: 900,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* Header */}
          <View
            style={{
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: "#6B7280",
              }}
            >
              Saved
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#111827",
                marginTop: 6,
              }}
            >
              Saved events
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginTop: 6,
                maxWidth: isWide ? 560 : undefined,
              }}
            >
              {savedCount === 0
                ? "Save an event to see it here."
                : `${savedCount} saved event${savedCount === 1 ? "" : "s"}.`}
            </Text>
          </View>

          {savedCount === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 18,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                Nothing saved yet
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", lineHeight: 18 }}>
                Open an event and tap “Save this Venue” (or save any event) to
                add it here.
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/event")}
                style={{
                  marginTop: 12,
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  backgroundColor: "#111827",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}
                >
                  Browse events
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            saved.map((item: any) => {
              const title = getSavedTitle(item);
              const locationLine = getSavedLocationLine(item);
              const dateLine = getSavedDateLine(item);
              const imageSource = getSavedImageSource(item);

              return (
                <View
                  key={String(item.id)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 22,
                    marginBottom: 12,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={imageSource}
                      style={{ width: 84, height: 84 }}
                      resizeMode="cover"
                    />

                    <View
                      style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {title}
                      </Text>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MapPin size={14} color="#6B7280" />
                        <Text
                          numberOfLines={1}
                          style={{
                            marginLeft: 6,
                            fontSize: 12,
                            color: "#374151",
                            flex: 1,
                          }}
                        >
                          {locationLine}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <Calendar size={14} color="#6B7280" />
                        <Text
                          numberOfLines={1}
                          style={{
                            marginLeft: 6,
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          {dateLine}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderTopColor: "#EEF2F7",
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/event/[id]",
                          params: { id: String(item.id) },
                        })
                      }
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
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
                        View
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => toggleSave(item)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: "#EF4444",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 12,
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

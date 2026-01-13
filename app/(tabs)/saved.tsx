// app/(tabs)/saved.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Heart, Ticket } from "lucide-react-native";
import React from "react";
import {
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
          {/* Header / collections card */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 32,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: "#F1F5FF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ticket size={26} color="#2563EB" />
              </View>
            </View>

            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1.3,
                textTransform: "uppercase",
                color: "#9CA3AF",
                marginBottom: 4,
              }}
            >
              Collections
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              Favorites & Saved Venues
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                maxWidth: isWide ? 560 : undefined,
              }}
            >
              Quick access to events you love and locations you plan to revisit.
            </Text>
          </View>

          {/* Favorite lineups */}
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#6B7280",
              marginBottom: 6,
            }}
          >
            Events
          </Text>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 18,
              marginBottom: 24,
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
                fontWeight: "600",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Saved events
            </Text>

            <View
              style={{
                marginTop: 10,
                borderRadius: 16,
                backgroundColor: "#F9FAFB",
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#4B5563",
                  marginBottom: 4,
                  textAlign: "center",
                }}
              >
                {savedCount === 0 ? "No saved events yet" : "Your saved list"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Tap the save button on any event to see it here instantly.
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/event")}
                style={{
                  alignSelf: "center",
                  borderRadius: 999,
                  backgroundColor: "#2563EB",
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  Browse events
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Saved locations header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#6B7280",
              }}
            >
              Venues
            </Text>
            {savedCount > 0 && (
              <View
                style={{
                  marginLeft: 6,
                  minWidth: 18,
                  paddingHorizontal: 6,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#2563EB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {savedCount}
                </Text>
              </View>
            )}
          </View>

          {/* Saved locations list */}
          {savedCount === 0 ? (
            <Text
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                marginTop: 8,
              }}
            >
              Save a venue from an event page and it will appear here.
            </Text>
          ) : (
            saved.map((event) => (
              <View
                key={event.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 22,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}
              >
                {/* Thumbnail */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: "#EEF2FF",
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Heart size={18} color="#2563EB" />
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#4B5563",
                    }}
                    numberOfLines={1}
                  >
                    {event.venue}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {event.city}
                  </Text>
                </View>

                {/* Buttons */}
                <View style={{ marginLeft: 8, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/event/[id]",
                        params: { id: String(event.id) },
                      })
                    }
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      marginBottom: 6,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleSave(event)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: "#EF4444",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

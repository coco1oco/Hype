// app/saved.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FavoritesContext } from "../context/FavoritesContext";
import { Home, Ticket, Heart, QrCode } from "lucide-react-native";

type TabKey = "home" | "saved" | "tickets" | "scan";

const tabs = [
  { key: "home" as TabKey, label: "Home", icon: Home, href: "/event" },
  { key: "saved" as TabKey, label: "Saved", icon: Heart, href: "/saved" },
  { key: "tickets" as TabKey, label: "Tickets", icon: Ticket, href: "/tickets" },
];

export default function SavedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const { saved, toggleSave } = React.useContext(FavoritesContext);
  const savedCount = saved.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 120, // space for navbar
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
              <Text style={{ fontSize: 26 }}>🎟️</Text>
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
            }}
          >
            Favorites & Saved Venues
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Quick access to artists you love and locations you plan to revisit.
          </Text>
        </View>

        {/* Favorite lineups (events favorites placeholder) */}
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
            Favorite lineups
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
              No favorites yet
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
                  backgroundColor: "#E5E7EB",
                  marginRight: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>🎫</Text>
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
                      pathname: "/event/[id]",
                      params: { id: event.id },
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
                    View event
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

      {/* Bottom nav bar */}
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
              const isActive = key === "saved";

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
    </SafeAreaView>
  );
}

// app/(tabs)/saved.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
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

function formatPHP(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `₱${amount.toLocaleString("en-PH")}`;
}

function getPriceLabel(item: any) {
  const raw = item?.tier_price ?? item?.price;
  if (Array.isArray(raw)) {
    const nums = raw.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    if (!nums.length) return null;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (min === max) return formatPHP(min);
    const a = formatPHP(min);
    const b = formatPHP(max);
    return a && b ? `${a}–${b}` : null;
  }

  const num = Number(raw);
  return formatPHP(num);
}

function getSavedTitle(item: any) {
  return (
    toText(item?.name) ||
    toText(item?.title) ||
    toText(item?.event_name) ||
    "Saved event"
  );
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

  const maxContentWidth = Math.min(width, 900);
  const contentPadding = 16;
  const gridGap = 14;
  const columns = 2;
  const cardWidth =
    (maxContentWidth - contentPadding * 2 - gridGap * (columns - 1)) / columns;
  const cardHeight = isWide ? 310 : 280;
  const imageHeight = Math.round(cardHeight * 0.7);

  return (
    <LinearGradient colors={["#f8f9fa", "#ffffff"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, focusStyle]}>
          <FlatList
            data={saved as any[]}
            keyExtractor={(item) => String((item as any)?.id)}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: contentPadding,
              paddingTop: 18,
              paddingBottom: tabBarHeight + 32,
              maxWidth: 900,
              width: "100%",
              alignSelf: "center",
            }}
            columnWrapperStyle={{ gap: gridGap }}
            ListHeaderComponent={
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.headerTitle}>SAVED</Text>
                <Text style={styles.headerBody}>
                  {savedCount === 0
                    ? "Save events you love for quick access."
                    : `${savedCount} saved event${savedCount === 1 ? "" : "s"}`}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No saved events</Text>
                <Text style={styles.emptyBody}>
                  Tap the heart on an event to save it.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/event")}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Browse events</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const title = getSavedTitle(item);
              const priceLabel = getPriceLabel(item) ?? "";
              const imageSource = getSavedImageSource(item);

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/event/[id]",
                      params: { id: String((item as any).id) },
                    })
                  }
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      height: cardHeight,
                    },
                  ]}
                >
                  <View style={{ height: imageHeight }}>
                    <Image
                      source={imageSource}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => toggleSave(item)}
                      style={styles.likeButtonWrap}
                    >
                      <BlurView
                        intensity={22}
                        tint="light"
                        style={styles.likeButton}
                      >
                        <Heart size={18} color="#111827" strokeWidth={1.5} />
                      </BlurView>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardMeta}>
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {title.toUpperCase()}
                    </Text>
                    <Text numberOfLines={1} style={styles.cardPrice}>
                      {priceLabel ? priceLabel.toUpperCase() : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: "BebasNeue",
    fontSize: 42,
    letterSpacing: 1,
    color: "#111827",
  },
  headerBody: {
    marginTop: 6,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  likeButtonWrap: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
  },
  likeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  cardTitle: {
    fontFamily: "BebasNeue",
    fontSize: 18,
    letterSpacing: 1,
    color: "#111827",
  },
  cardPrice: {
    marginTop: 4,
    fontFamily: "BebasNeue",
    fontSize: 16,
    letterSpacing: 1,
    color: "#111827",
    opacity: 0.7,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  emptyTitle: {
    fontFamily: "BebasNeue",
    fontSize: 22,
    letterSpacing: 1,
    color: "#111827",
  },
  emptyBody: {
    marginTop: 6,
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: "#6B7280",
  },
  emptyButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});

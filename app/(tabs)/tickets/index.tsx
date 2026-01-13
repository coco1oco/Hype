// app/(tabs)/tickets/index.tsx
import { supabase } from "@/lib/supabase";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { QrCode as QrCodeIcon, X } from "lucide-react-native";
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const fallbackImage = require("../../../assets/twice.jpg");

const TicketsScreen: React.FC = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [qrTicket, setQrTicket] = React.useState<any | null>(null);

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

  const loadTickets = React.useCallback(async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setTickets([]);
      return;
    }

    const userId = authData.user.id;

    const { data, error } = await supabase
      .from("tickets")
      .select(
        `
        id,
        event_id,
        buyer_name,
        buyer_email,
        quantity,
        tier_name,
        created_at,
        status,
        event:event_id (
          id,
          name
        )
      `
      )
      .eq("buyer_id", userId)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("tickets load error", error.message);
      setTickets([]);
      return;
    }

    setTickets(data ?? []);
  }, []);

  React.useEffect(() => {
    if (!isFocused) return;
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        await loadTickets();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [isFocused, loadTickets]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTickets();
    } finally {
      setRefreshing(false);
    }
  }, [loadTickets]);

  return (
    <LinearGradient colors={["#f8f9fa", "#ffffff"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, focusStyle]}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#9CA3AF"
              />
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: tabBarHeight + 32,
              maxWidth: 900,
              alignSelf: "center",
              width: "100%",
            }}
          >
            <Text style={styles.headerTitle}>MY TICKETS</Text>
            <Text style={styles.headerBody}>
              Your paid passes are ready to scan at the gate.
            </Text>

            {loading ? (
              <Text style={styles.loadingText}>Loading…</Text>
            ) : tickets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No tickets yet</Text>
                <Text style={styles.emptyBody}>
                  Once you purchase a ticket, it will appear here with a QR code
                  for entry.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/event")}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Browse events</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 14 }}>
                {tickets.map((t) => {
                  const issued =
                    t.created_at &&
                    new Date(t.created_at).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });

                  const eventName = String(t.event?.name ?? "Event");

                  const issuedDate = issued ? issued.split(",")[0] : "—";
                  const issuedTime = issued
                    ? issued.split(",").slice(1).join(",").trim()
                    : "—";

                  return (
                    <View key={t.id} style={styles.passCard}>
                      <View style={styles.passTop}>
                        <Image
                          source={fallbackImage}
                          style={styles.passImage}
                        />
                        <LinearGradient
                          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.0)"]}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0, y: 0 }}
                          style={styles.passImageOverlay}
                        />

                        <Text numberOfLines={2} style={styles.passTitle}>
                          {eventName.toUpperCase()}
                        </Text>

                        <View style={styles.badgeWrap}>
                          <BlurView
                            intensity={22}
                            tint="light"
                            style={styles.badgeBlur}
                          >
                            <View
                              style={[
                                styles.badgePill,
                                t.status === "paid"
                                  ? styles.badgeOk
                                  : styles.badgeMuted,
                              ]}
                            >
                              <Text style={styles.badgeText}>
                                {t.status === "paid"
                                  ? "VALID"
                                  : String(t.status).toUpperCase()}
                              </Text>
                            </View>
                          </BlurView>
                        </View>
                      </View>

                      <View style={styles.passMetaGrid}>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>DATE</Text>
                          <Text style={styles.metaValue} numberOfLines={1}>
                            {issuedDate}
                          </Text>
                        </View>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>TIME</Text>
                          <Text style={styles.metaValue} numberOfLines={1}>
                            {issuedTime}
                          </Text>
                        </View>
                        <View style={styles.metaCell}>
                          <Text style={styles.metaLabel}>SEAT</Text>
                          <Text style={styles.metaValue} numberOfLines={1}>
                            {t.tier_name ?? "General"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tearRow}>
                        <View style={styles.tearNotchLeft} />
                        <View style={styles.tearLine} />
                        <View style={styles.tearNotchRight} />
                      </View>

                      <View style={styles.passBottom}>
                        <View>
                          <Text style={styles.metaLabel}>QTY</Text>
                          <Text style={styles.metaValue}>
                            {t.quantity ?? 1}
                          </Text>
                        </View>

                        <View style={styles.bottomActions}>
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setQrTicket(t)}
                            style={[
                              styles.actionButton,
                              styles.actionButtonDark,
                            ]}
                          >
                            <QrCodeIcon
                              size={16}
                              color="#fff"
                              strokeWidth={1.5}
                            />
                            <Text style={styles.actionButtonTextDark}>
                              Show QR
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() =>
                              router.push({
                                pathname: "/(tabs)/event/[id]",
                                params: { id: String(t.event_id) },
                              })
                            }
                            style={[
                              styles.actionButton,
                              styles.actionButtonLight,
                            ]}
                          >
                            <Text style={styles.actionButtonTextLight}>
                              View event
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <Modal
            transparent
            animationType="fade"
            visible={!!qrTicket}
            onRequestClose={() => setQrTicket(null)}
          >
            <StatusBar barStyle="dark-content" />
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setQrTicket(null)}
            >
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>SCAN AT ENTRY</Text>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setQrTicket(null)}
                    style={styles.modalClose}
                  >
                    <X size={18} color="#111827" strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalQRWrap}>
                  <QRCode value={String(qrTicket?.id ?? "-")} size={240} />
                </View>

                <Text style={styles.modalHint}>
                  Keep this screen bright and steady for quick scanning.
                </Text>
              </Pressable>
            </Pressable>
          </Modal>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TicketsScreen;

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
  loadingText: {
    marginTop: 14,
    color: "#6B7280",
    fontSize: 13,
  },
  emptyCard: {
    marginTop: 14,
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
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  passCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  passTop: {
    height: 150,
    position: "relative",
  },
  passImage: {
    width: "100%",
    height: "100%",
  },
  passImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  passTitle: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    fontFamily: "BebasNeue",
    fontSize: 22,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  badgeWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  badgeBlur: {
    padding: 6,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeOk: {
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  badgeMuted: {
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  badgeText: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "#FFFFFF",
  },
  passMetaGrid: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metaCell: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#9CA3AF",
  },
  metaValue: {
    marginTop: 4,
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    color: "#111827",
  },
  tearRow: {
    height: 24,
    position: "relative",
    justifyContent: "center",
  },
  tearLine: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginHorizontal: 16,
  },
  tearNotchLeft: {
    position: "absolute",
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  tearNotchRight: {
    position: "absolute",
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  passBottom: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionButtonDark: {
    backgroundColor: "#111827",
  },
  actionButtonLight: {
    backgroundColor: "#F3F4F6",
  },
  actionButtonTextDark: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  actionButtonTextLight: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: "BebasNeue",
    fontSize: 20,
    letterSpacing: 1,
    color: "#111827",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalQRWrap: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 18,
  },
  modalHint: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#6B7280",
  },
});

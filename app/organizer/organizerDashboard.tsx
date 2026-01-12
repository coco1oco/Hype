// app/organizer/index.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Calendar,
  MapPin,
  Ticket,
  LogOut,
  Type,
  Rows3,
  Image as ImageIcon,
  FileCheck2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import "react-native-url-polyfill/auto";
import { supabase } from "../../lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

const OrganizerDashboardScreen: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)/login" as any);
  };

  // create‑event modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [eventName, setEventName] = React.useState("");
  const [eventDate, setEventDate] = React.useState(""); // will convert to ISO
  const [eventLocation, setEventLocation] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tierName, setTierName] = React.useState("VIP");
  const [tierPrice, setTierPrice] = React.useState("");
  const [tierSeats, setTierSeats] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // uploaded image URLs
  const [proofImages, setProofImages] = React.useState<string[]>([]);
  const [featuredImages, setFeaturedImages] = React.useState<string[]>([]);

  // organizer events
  const [myEvents, setMyEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(false);

  // load events for logged-in organizer
  React.useEffect(() => {
    const loadMyEvents = async () => {
      setLoadingEvents(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingEvents(false);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("id, name, date, location, status, created_at")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMyEvents(data);
      }

      setLoadingEvents(false);
    };

    loadMyEvents();
  }, []);

  const refreshMyEvents = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("events")
      .select("id, name, date, location, status, created_at")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMyEvents(data);
  };

  // pick images from device
  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg("Please allow photo library access to upload images.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return null;

    return result.assets.map((a) => a.uri);
  };

  // upload a single image to Supabase Storage
  const uploadImageToBucket = async (uri: string, bucket: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const ext = uri.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const fileBuffer = Buffer.from(base64, "base64");

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType:
            ext === "png"
              ? "image/png"
              : ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : "image/*",
        });

      if (error) {
        setErrorMsg(error.message);
        return null;
      }

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicData.publicUrl as string;
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to upload image.");
      return null;
    }
  };

  const handlePickProofImages = async () => {
    setErrorMsg(null);
    const uris = await pickImages();
    if (!uris) return;

    setLoading(true);
    const uploaded: string[] = [];
    for (const uri of uris) {
      const url = await uploadImageToBucket(uri, "event_proofs");
      if (url) uploaded.push(url);
    }
    setLoading(false);
    if (uploaded.length) setProofImages((prev) => [...prev, ...uploaded]);
  };

  const handlePickFeaturedImages = async () => {
    setErrorMsg(null);
    const uris = await pickImages();
    if (!uris) return;

    setLoading(true);
    const uploaded: string[] = [];
    for (const uri of uris) {
      const url = await uploadImageToBucket(uri, "event_photos");
      if (url) uploaded.push(url);
    }
    setLoading(false);
    if (uploaded.length) setFeaturedImages((prev) => [...prev, ...uploaded]);
  };

  // Submit event into events with status = 'pending'
  const handleSubmitEvent = async () => {
    setErrorMsg(null);
    setLoading(true);

    if (!eventName || !eventDate || !eventLocation || !description) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const dateValue = new Date(eventDate);
    if (isNaN(dateValue.getTime())) {
      setErrorMsg("Please enter a valid date.");
      setLoading(false);
      return;
    }

    if (!proofImages.length || !featuredImages.length) {
      setErrorMsg(
        "Please upload proof of legitimacy and at least one featured photo."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("events").insert({
      name: eventName,
      date: dateValue.toISOString(),
      location: eventLocation,
      description,
      tier_name: tierName,
      tier_price: Number(tierPrice) || 0,
      tier_seats: Number(tierSeats) || 0,
      proof_images: proofImages,
      featured_images: featuredImages, // used on buyer side
      status: "pending",
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // reset form on success
    setEventName("");
    setEventDate("");
    setEventLocation("");
    setDescription("");
    setTierName("VIP");
    setTierPrice("");
    setTierSeats("");
    setProofImages([]);
    setFeaturedImages([]);
    setLoading(false);
    setShowCreateModal(false);

    await refreshMyEvents();
    Alert.alert("Event submitted", "Your event is pending admin approval.");
  };

  const approvedEvents = myEvents.filter((e) => e.status === "approved");
  const pendingEvents = myEvents.filter((e) => e.status === "pending");

  return (
    <LinearGradient
      colors={["#020617", "#0b1220", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Dashboard content */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
          }}
        >
          {/* Top bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#F9FAFB",
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                Organizer
              </Text>
              <Text
                style={{
                  color: "rgba(249,250,251,0.8)",
                  fontSize: 13,
                }}
              >
                Dashboard
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#2563EB",
                }}
                onPress={() => setShowCreateModal(true)}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  + Create Event
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.7)",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(15,23,42,0.7)",
                }}
                onPress={handleLogout}
              >
                <LogOut size={18} color="#E5E7EB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Subtitle */}
          <Text
            style={{
              color: "rgba(209,213,219,0.9)",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            Manage your events and track ticket sales.
          </Text>

          {/* Pending approval card */}
          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: "#FDE68A",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#92400E",
                marginBottom: 4,
              }}
            >
              Pending Approval
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#92400E",
              }}
            >
              {loadingEvents
                ? "Checking your events..."
                : pendingEvents.length === 0
                ? "No events waiting for admin approval."
                : `You have ${pendingEvents.length} event${
                    pendingEvents.length === 1 ? "" : "s"
                  } waiting for admin approval.`}
            </Text>
          </View>

          {/* Active events header */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#E5E7EB",
              marginBottom: 8,
            }}
          >
            Active Events
          </Text>

          {/* Active events list */}
          {loadingEvents && approvedEvents.length === 0 ? (
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                marginBottom: 12,
              }}
            >
              Loading your events...
            </Text>
          ) : approvedEvents.length === 0 ? (
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                marginBottom: 12,
              }}
            >
              No approved events yet.
            </Text>
          ) : (
            approvedEvents.map((e) => (
              <TouchableOpacity
                key={e.id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push(`/organizer/event?id=${e.id}` as any)
                }
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  backgroundColor: "#0F172A",
                  marginBottom: 18,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.4)",
                }}
              >
                {/* Gradient banner */}
                <LinearGradient
                  colors={["#4F46E5", "#2563EB", "#0EA5E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 110,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: "rgba(248,250,252,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(15,23,42,0.25)",
                      }}
                    >
                      <Calendar size={26} color="#F9FAFB" />
                    </View>

                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "#F9FAFB",
                        }}
                        numberOfLines={1}
                      >
                        {e.name}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Calendar size={14} color="#E5E7EB" />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#E5E7EB",
                            marginLeft: 4,
                          }}
                        >
                          {e.date
                            ? new Date(e.date).toLocaleDateString()
                            : "TBA"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status pill */}
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(22,163,74,0.25)",
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: "#22C55E",
                        marginRight: 4,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: "#BBF7D0",
                        textTransform: "uppercase",
                      }}
                    >
                      approved
                    </Text>
                  </View>
                </LinearGradient>

                {/* Bottom stats row */}
                <View
                  style={{
                    backgroundColor: "#020617",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Location */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <MapPin size={14} color="#9CA3AF" />
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginLeft: 4,
                      }}
                      numberOfLines={1}
                    >
                      {e.location}
                    </Text>
                  </View>

                  {/* Tickets sold placeholder */}
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Pending events header */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#E5E7EB",
              marginBottom: 8,
            }}
          >
            Pending Events
          </Text>

          {/* Pending events list */}
          {loadingEvents && pendingEvents.length === 0 ? (
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
              }}
            >
              Loading pending events...
            </Text>
          ) : pendingEvents.length === 0 ? (
            <View
              style={{
                borderRadius: 20,
                backgroundColor: "rgba(15,23,42,0.9)",
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.5)",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#E5E7EB",
                  marginBottom: 4,
                }}
              >
                No pending events yet.
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(148,163,184,0.9)",
                }}
              >
                New event submissions that require admin approval will appear
                here.
              </Text>
            </View>
          ) : (
            pendingEvents.map((e) => (
              <View
                key={e.id}
                style={{
                  borderRadius: 20,
                  backgroundColor: "rgba(15,23,42,0.9)",
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.5)",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#E5E7EB",
                    fontWeight: "600",
                  }}
                >
                  {e.name}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {e.location} · Submitted{" "}
                  {new Date(e.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Create Event modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: "100%",
                maxHeight: "90%",
                borderRadius: 22,
                backgroundColor: "#F9FAFB",
                paddingHorizontal: 18,
                paddingVertical: 20,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Create New Event
                </Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={{ fontSize: 20, color: "#6B7280" }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Event Name */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Type
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Event Name *
                  </Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 10,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <TextInput
                    placeholder="Enter event name"
                    placeholderTextColor="#9CA3AF"
                    value={eventName}
                    onChangeText={setEventName}
                    style={{ fontSize: 14, color: "#111827" }}
                  />
                </View>

                {/* Event Date */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Calendar
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Event Date *
                  </Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 10,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <TextInput
                    placeholder="dd/mm/yyyy --:-- --"
                    placeholderTextColor="#9CA3AF"
                    value={eventDate}
                    onChangeText={setEventDate}
                    style={{ fontSize: 14, color: "#111827" }}
                  />
                </View>

                {/* Location */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <MapPin
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Location *
                  </Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 10,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <TextInput
                    placeholder="Event venue"
                    placeholderTextColor="#9CA3AF"
                    value={eventLocation}
                    onChangeText={setEventLocation}
                    style={{ fontSize: 14, color: "#111827" }}
                  />
                </View>

                {/* Description */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Rows3
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Description *
                  </Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginBottom: 16,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <TextInput
                    placeholder="Describe your event..."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    style={{ fontSize: 14, color: "#111827" }}
                    multiline
                  />
                </View>

                {/* Seat Tiers header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ticket
                      size={16}
                      color="#111827"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Seat Tiers & Pricing
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#2563EB" }}>
                    + Add Tier
                  </Text>
                </View>

                {/* Tier card */}
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4B5563",
                      marginBottom: 4,
                    }}
                  >
                    Tier Name
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      value={tierName}
                      onChangeText={setTierName}
                      placeholder="VIP"
                      placeholderTextColor="#9CA3AF"
                      style={{ fontSize: 14, color: "#111827" }}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4B5563",
                      marginBottom: 4,
                    }}
                  >
                    Price (₱)
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      value={tierPrice}
                      onChangeText={setTierPrice}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      style={{ fontSize: 14, color: "#111827" }}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4B5563",
                      marginBottom: 4,
                    }}
                  >
                    Total Seats
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <TextInput
                      value={tierSeats}
                      onChangeText={setTierSeats}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      style={{ fontSize: 14, color: "#111827" }}
                    />
                  </View>
                </View>

                {/* Proof of legitimacy */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <FileCheck2
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Proof of Event Legitimacy *
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 12,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Upload documents that verify your event (permits,
                    contracts, etc.).
                  </Text>

                  <TouchableOpacity
                    onPress={handlePickProofImages}
                    activeOpacity={0.9}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#2563EB",
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      backgroundColor: "#EFF6FF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#1D4ED8",
                        fontWeight: "600",
                      }}
                    >
                      Upload images
                    </Text>
                  </TouchableOpacity>

                  {proofImages.length > 0 && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        marginTop: 6,
                      }}
                    >
                      {proofImages.length} file
                      {proofImages.length === 1 ? "" : "s"} uploaded
                    </Text>
                  )}
                </View>

                {/* Featured photos */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <ImageIcon
                    size={16}
                    color="#4B5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: "#4B5563" }}>
                    Featured Photos *
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 16,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Upload photos that will be shown to buyers on your event
                    page.
                  </Text>

                  <TouchableOpacity
                    onPress={handlePickFeaturedImages}
                    activeOpacity={0.9}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#2563EB",
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      backgroundColor: "#EFF6FF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#1D4ED8",
                        fontWeight: "600",
                      }}
                    >
                      Upload photos
                    </Text>
                  </TouchableOpacity>

                  {featuredImages.length > 0 && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        marginTop: 6,
                      }}
                    >
                      {featuredImages.length} photo
                      {featuredImages.length === 1 ? "" : "s"} uploaded
                    </Text>
                  )}
                </View>

                {errorMsg && (
                  <Text
                    style={{
                      color: "#DC2626",
                      fontSize: 12,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {errorMsg}
                  </Text>
                )}

                {/* Footer buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#D1D5DB",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                      backgroundColor: "#FFFFFF",
                    }}
                    onPress={() => setShowCreateModal(false)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 999,
                      backgroundColor: "#2563EB",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 8,
                      opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                    onPress={handleSubmitEvent}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#FFFFFF",
                        fontWeight: "600",
                      }}
                    >
                      {loading ? "Submitting..." : "Submit for Approval"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OrganizerDashboardScreen;

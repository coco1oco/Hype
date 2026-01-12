// app/purchase/checkout/[id].tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Buffer } from "buffer";
import { supabase } from "../../../lib/supabase";

const ADMIN_GCASH_NUMBER = "0936 895 3243";

const CheckoutProofScreen: React.FC = () => {
  const router = useRouter();
  const { id: eventId, quantity } =
    useLocalSearchParams<{ id: string; quantity?: string }>();

  const [event, setEvent] = React.useState<any | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  const qty = Number(quantity ?? "1") || 1;

  React.useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("checkout event error", error);
      }
      setEvent(data ?? null);
    };

    load();
  }, [eventId]);

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos to upload proof."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !eventId) {
      Alert.alert("Missing proof", "Please upload a screenshot first.");
      return;
    }

    try {
      setUploading(true);

      // get current user (profiles.id)
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("auth error", authError);
        Alert.alert("Error", "You must be logged in to submit a purchase.");
        return;
      }
      const userId = authData.user.id; // matches profiles.id

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      const buffer = Buffer.from(base64, "base64");

      const fileName = `proofs/${eventId}/${Date.now()}.jpg`;

      const { data: storageData, error: storageError } =
        await supabase.storage.from("payments").upload(fileName, buffer, {
          contentType: "image/jpeg",
        });

      if (storageError || !storageData) {
        console.error("upload error", storageError);
        Alert.alert("Upload failed", "Could not upload screenshot.");
        return;
      }

      const filePath = storageData.path;

      const { error: insertError } = await supabase
        .from("purchases")
        .insert({
          event_id: eventId,
          buyer_id: userId,           // <— link to profiles.id
          proof_path: filePath,
          status: "pending_review",
          quantity: qty,              // how many seats this purchase is for
        });

      if (insertError) {
        console.error("purchase insert error", insertError);
        Alert.alert(
          "Error",
          "Could not submit your purchase. Please try again."
        );
        return;
      }

      Alert.alert(
        "Submitted",
        "Your proof was submitted and will be reviewed by an admin.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setUploading(false);
    }
  };

  const gcashNumber = ADMIN_GCASH_NUMBER;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#fff",
            alignSelf: "flex-start",
            marginBottom: 12,
          }}
        >
          <Text>← Back</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Pay via GCash
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 6,
            }}
          >
            Admin GCash details
          </Text>
          <Text
            style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}
          >
            Please send the full amount to the administrator using GCash,
            then upload a screenshot of your payment.
          </Text>

          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              padding: 12,
              backgroundColor: "#F9FAFB",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              GCash number
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 6,
              }}
            >
              {gcashNumber}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              Account name: {event?.organizer_name || "Administrator"}
            </Text>
          </View>
        </View>

        {/* proof upload */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Upload proof of payment
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#6B7280",
              marginBottom: 12,
            }}
          >
            Upload a clear screenshot showing the GCash reference number and
            amount paid.
          </Text>

          {imageUri && (
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 8,
                marginBottom: 12,
              }}
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: 220, borderRadius: 8 }}
                resizeMode="cover"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={pickImage}
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#2563EB",
              paddingVertical: 10,
              alignItems: "center",
              marginBottom: 12,
              backgroundColor: "#EFF6FF",
            }}
          >
            <Text
              style={{
                color: "#2563EB",
                fontWeight: "600",
              }}
            >
              {imageUri ? "Change screenshot" : "Upload screenshot"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!imageUri || uploading}
            onPress={handleSubmit}
            style={{
              borderRadius: 999,
              backgroundColor:
                !imageUri || uploading ? "#9CA3AF" : "#16A34A",
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              {uploading ? "Submitting..." : "Submit purchase"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutProofScreen;

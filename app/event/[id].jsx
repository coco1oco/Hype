import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Optional: for text readability
import { events } from "../../data/events";
import { GlassView } from "../../components/ui/GlassView";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find the event from our data
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Event not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-system-gray6">
      <StatusBar style="light" />

      {/* 1. Transparent Header Config */}
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center ml-2 border border-white/10"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-2 border border-white/10">
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Image Section */}
        <View className="relative h-96 w-full">
          <ImageBackground
            source={event.cover}
            className="w-full h-full"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 200,
              }}
            />

            <View className="absolute bottom-0 w-full p-5 pb-8">
              <View className="flex-row gap-2 mb-3">
                <View className="bg-system-blue/80 px-3 py-1 rounded-full backdrop-blur-md">
                  <Text className="text-white text-xs font-bold uppercase">
                    {event.category}
                  </Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <Text className="text-white text-xs font-bold">
                    ★ {event.hypeScore} Hype
                  </Text>
                </View>
              </View>

              <Text className="text-white text-4xl font-black leading-tight mb-2 shadow-sm">
                {event.title}
              </Text>

              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#d1d5db" />
                <Text className="text-gray-300 ml-1 font-medium">
                  {event.venue} • {event.city}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* 3. Content Section (Glass Card overlap) */}
        <View className="-mt-6 px-4">
          <GlassView intensity={80} className="p-6 mb-6">
            <Text className="text-lg font-bold text-black mb-3">
              About the Event
            </Text>
            <Text className="text-text-secondary leading-6">
              {event.description ||
                "Join us for an unforgettable experience. Secure your verified tickets now on Hype."}
            </Text>
          </GlassView>

          {/* Ticket Tiers */}
          <Text className="text-xl font-bold text-black mb-4 ml-1">
            Tickets
          </Text>

          <View className="gap-4">
            {event.tiers?.map((tier) => (
              <GlassView
                key={tier.name}
                intensity={60}
                className="p-4 flex-row justify-between items-center bg-white/40"
              >
                <View>
                  <Text className="font-bold text-lg text-black">
                    {tier.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {tier.available} available
                  </Text>
                </View>
                <TouchableOpacity className="bg-system-blue px-5 py-3 rounded-xl shadow-sm active:opacity-80">
                  <Text className="text-white font-bold">
                    {tier.currency} {tier.price.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </GlassView>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 4. Sticky Bottom Action Bar */}
      <GlassView
        intensity={95}
        className="absolute bottom-0 w-full px-5 py-4 pb-8 border-t border-white/20 flex-row items-center gap-4"
        style={{ paddingBottom: 34 }} // Safe area padding manually
      >
        <View className="flex-1">
          <Text className="text-text-secondary text-xs uppercase font-bold">
            Starting from
          </Text>
          <Text className="text-2xl font-black text-black">
            {event.tiers?.[0]?.currency}{" "}
            {event.tiers?.[0]?.price.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity className="bg-black flex-1 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex-row justify-center items-center gap-2">
          <Text className="text-white font-bold text-lg">Get Tickets</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </GlassView>
    </View>
  );
}

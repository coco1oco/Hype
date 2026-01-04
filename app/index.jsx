import { ScrollView, View, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { events } from "../data/events"; // The file you just copied
import EventCard from "../components/EventCard"; // The component we made earlier

export default function Home() {
  // Simple state for the prototype
  const isFavorite = (id) => false;
  const toggleFavorite = (id) => console.log("Toggle", id);

  return (
    <View className="flex-1 bg-system-gray6">
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <SafeAreaView className="pt-4 px-5 mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <Image
              source={require("../assets/icon.png")}
              className="w-10 h-10 rounded-xl"
            />
            {/* Note: If you don't have icon.png in assets yet, 
                 comment out the Image above to avoid errors */}
          </View>

          <Text className="text-5xl font-black tracking-tighter text-black mb-2">
            hype
          </Text>
          <Text className="text-text-secondary text-lg font-medium">
            Second-hand tickets, zero second thoughts.
          </Text>
        </SafeAreaView>

        {/* Event List */}
        <View className="px-5">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isFavorite={isFavorite(event.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

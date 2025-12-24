import React, { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getTrendingUnderground } from "../api/audius";
import { usePlayerStore } from "../player/playerStore";
import MiniPlayer from "../components/MiniPlayer";
import { Alert } from "react-native";


export default function HomeScreen({ navigation }: any) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrendingUnderground(25),
  });

  const setQueue = usePlayerStore((s) => s.setQueue);
  const playAt = usePlayerStore((s) => s.playAt);
  const enqueueNext = usePlayerStore((s) => s.enqueueNext);
  const enqueueLast = usePlayerStore((s) => s.enqueueLast);


  useEffect(() => {
    if (data) setQueue(data);
  }, [data, setQueue]);

  if (isLoading) return <Text style={{ padding: 16 }}>Loading...</Text>;
  if (isError) return <Text style={{ padding: 16 }}>Error</Text>;

  const tracks = data ?? [];

const openTrackMenu = (tracks: any[], index: number) => {
  const track = tracks[index];

  Alert.alert(track.title, track.artist, [
    {
      text: "今すぐ再生",
      onPress: async () => {
        setQueue(tracks);
        await playAt(index);
        navigation.navigate("Player");
      },
    },
    {
      text: "次に再生",
      onPress: async () => {
        await enqueueNext(track);
      },
    },
    {
      text: "キュー末尾に追加",
      onPress: async () => {
        await enqueueLast(track);
      },
    },
    { text: "キャンセル", style: "cancel" },
  ]);
};

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90  }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Trending (Underground)
      </Text>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={async () => {
              setQueue(tracks);
              await playAt(index);
              navigation.navigate("Player");
            }}
            onLongPress={() => openTrackMenu(tracks, index)}
            delayLongPress={250}
            style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
          >
            <Text numberOfLines={1} style={{ fontWeight: "700" }}>{item.title}</Text>
            <Text numberOfLines={1} style={{ opacity: 0.7 }}>{item.artist}</Text>
          </Pressable>
        )}
      />
      <MiniPlayer onOpen={() => navigation.navigate("Player")} />
    </View>
  );
}

import React, { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { searchTracks } from "../api/audius";
import { usePlayerStore } from "../player/playerStore";
import MiniPlayer from "../components/MiniPlayer";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Alert } from "react-native";



export default function SearchScreen({ navigation }: any) {
  const [text, setText] = useState("");

  // 入力が短すぎるとAPI叩かない（無駄撃ち防止）
  const q = useDebouncedValue(text.trim(), 350);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchTracks(q, 25),
    enabled: q.length >= 2,
  });

  const setQueue = usePlayerStore((s) => s.setQueue);
  const playAt = usePlayerStore((s) => s.playAt);
  const enqueueNext = usePlayerStore((s) => s.enqueueNext);
  const enqueueLast = usePlayerStore((s) => s.enqueueLast);

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


  const tracks = data ?? [];

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>Search</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Search tracks..."
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
        }}
      />

      {q.length < 2 && <Text style={{ opacity: 0.6 }}>Type 2+ characters</Text>}
      {isLoading && q.length >= 2 && <Text>Loading...</Text>}
      {isError && <Text>Error</Text>}

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

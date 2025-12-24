import React from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { usePlayerStore } from "../player/playerStore";
import MiniPlayer from "../components/MiniPlayer";

function RightAction({ onDelete }: { onDelete: () => void }) {
  return (
    <Pressable
      onPress={onDelete}
      style={{
        width: 92,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        marginLeft: 10,
      }}
    >
      <Text style={{ fontWeight: "800" }}>Delete</Text>
    </Pressable>
  );
}

export default function QueueScreen({ navigation }: any) {
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const jumpTo = usePlayerStore((s) => s.jumpTo);
  const removeAt = usePlayerStore((s) => s.removeAt);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const onClear = () => {
    Alert.alert("キューをクリアしますか？", "", [
      { text: "キャンセル", style: "cancel" },
      { text: "クリア", style: "destructive", onPress: () => clearQueue() },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 90 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>Queue</Text>

        <Pressable
          onPress={onClear}
          style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Clear</Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: 8, opacity: 0.6 }}>
        {queue.length === 0 ? "キューは空です" : `${queue.length} tracks`}
      </Text>

      <View style={{ height: 14 }} />

      <FlatList
        data={queue}
        keyExtractor={(item, i) => `${item.id}-${i}`} // 同曲複数追加でも安定
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index: i }) => {
          const isCurrent = i === index;

          return (
            <Swipeable
              renderRightActions={() => (
                <RightAction
                  onDelete={() => {
                    removeAt(i);
                  }}
                />
              )}
              overshootRight={false}
            >
              <Pressable
                onPress={async () => {
                  await jumpTo(i);
                  navigation.navigate("Player");
                }}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  backgroundColor: "white",
                }}
              >
                <Text numberOfLines={1} style={{ fontWeight: "800" }}>
                  {isCurrent ? "▶︎ " : ""}
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={{ opacity: 0.7 }}>
                  {item.artist}
                </Text>

                <Text style={{ marginTop: 6, opacity: 0.5, fontSize: 12 }}>
                  右スワイプで削除
                </Text>
              </Pressable>
            </Swipeable>
          );
        }}
      />

      <MiniPlayer onOpen={() => navigation.navigate("Player")} />
    </View>
  );
}

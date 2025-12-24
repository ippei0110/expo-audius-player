import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { usePlayerStore } from "../player/playerStore";

export default function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);

  if (!current) return null;

  const ratio = durationMs > 0 ? Math.min(positionMs / durationMs, 1) : 0;

  return (
    <View
  style={{
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    overflow: "hidden",
    borderWidth: 1,

    // iOS影
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },

    // Android影
    elevation: 8,
  }}
>

      {/* 進捗バー */}
      <View style={{ height: 3, backgroundColor: "#eee" }}>
        <View style={{ height: 3, width: `${ratio * 100}%`, backgroundColor: "#111" }} />
      </View>

      <View
        style={{
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* artwork */}
        {current.artworkUrl ? (
          <Image
            source={{ uri: current.artworkUrl }}
            style={{ width: 44, height: 44, borderRadius: 10 }}
          />
        ) : (
          <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#ddd" }} />
        )}

        {/* タップ領域 */}
        <Pressable onPress={onOpen} style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontWeight: "800" }}>
            {current.title}
          </Text>
          <Text numberOfLines={1} style={{ opacity: 0.7 }}>
            {current.artist}
          </Text>
        </Pressable>

        {/* 再生/停止 */}
        <Pressable
          onPress={toggle}
          hitSlop={10}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 10,
          }}
        >
          <Text>{isPlaying ? "Pause" : "Play"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

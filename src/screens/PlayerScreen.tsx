import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { usePlayerStore } from "../player/playerStore";

const msToTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

export default function PlayerScreen() {
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seek = usePlayerStore((s) => s.seek);

  // シーク中はUIだけ追従（指を離したらseek）
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubMs, setScrubMs] = useState(0);

  const shownPosition = isScrubbing ? scrubMs : positionMs;
  const ratio = durationMs > 0 ? Math.min(shownPosition / durationMs, 1) : 0;

  const artwork = useMemo(() => current?.artworkUrl, [current]);

  if (!current) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 16, opacity: 0.7 }}>No track</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Artwork */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        {artwork ? (
          <Image
            source={{ uri: artwork }}
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 24,
              borderWidth: 1,
              backgroundColor: "#fff",
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 24,
              borderWidth: 1,
              backgroundColor: "#eee",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ opacity: 0.6 }}>No Artwork</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <View style={{ marginTop: 18 }}>
        <Text numberOfLines={2} style={{ fontSize: 20, fontWeight: "800" }}>
          {current.title}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 6, opacity: 0.7, fontSize: 14 }}>
          {current.artist}
        </Text>
      </View>

      {/* Progress */}
      <View style={{ marginTop: 18 }}>
        <Slider
          value={durationMs ? shownPosition : 0}
          minimumValue={0}
          maximumValue={Math.max(durationMs, 1)}
          onValueChange={(v) => {
            setIsScrubbing(true);
            setScrubMs(Math.floor(v));
          }}
          onSlidingComplete={async (v) => {
            const ms = Math.floor(v);
            setIsScrubbing(false);
            await seek(ms);
          }}
          style={{ width: "100%" }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{msToTime(shownPosition)}</Text>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{msToTime(durationMs)}</Text>
        </View>

        {/* 小さめの進捗バー（見た目の補助：なくてもOK） */}
        <View style={{ height: 3, backgroundColor: "#eee", borderRadius: 999, marginTop: 10 }}>
          <View
            style={{
              height: 3,
              width: `${ratio * 100}%`,
              backgroundColor: "#111",
              borderRadius: 999,
            }}
          />
        </View>
      </View>

      {/* Controls */}
      <View
        style={{
          marginTop: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={prev}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "800" }}>◀︎</Text>
        </Pressable>

        <Pressable
          onPress={toggle}
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "900", fontSize: 16 }}>
            {isPlaying ? "❚❚" : "▶︎"}
          </Text>
        </Pressable>

        <Pressable
          onPress={next}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "800" }}>▶︎</Text>
        </Pressable>
      </View>

      {/* Small actions (optional) */}
      <View style={{ marginTop: 18, flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>Tip</Text>
          <Text style={{ marginTop: 4, fontWeight: "700" }}>
            長押しでキュー操作
          </Text>
        </View>
        <View style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>Queue</Text>
          <Text style={{ marginTop: 4, fontWeight: "700" }}>
            Queue画面で並び確認
          </Text>
        </View>
      </View>
    </View>
  );
}

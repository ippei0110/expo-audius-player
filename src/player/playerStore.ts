import { create } from "zustand";
import type { Track } from "../api/audius";
import * as engine from "./playerEngine";

type State = {
  queue: Track[];
  index: number;
  current?: Track;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  jumpTo: (index: number) => Promise<void>;
removeAt: (index: number) => void;
clearQueue: () => Promise<void>;


  setQueue: (tracks: Track[]) => void;
  playAt: (index: number) => Promise<void>;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
  tick: () => Promise<void>;
  enqueueNext: (track: Track) => Promise<void>;
  enqueueLast: (track: Track) => Promise<void>;
};

export const usePlayerStore = create<State>((set, get) => ({
  queue: [],
  index: 0,
  current: undefined,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,

  setQueue: (tracks) => set({ queue: tracks }),

  playAt: async (index) => {
  const q = get().queue;
  const t = q[index];
  if (!t) return;

  // まずUIを初期化
  set({
    index,
    current: t,
    isPlaying: true,
    positionMs: 0,
    durationMs: 0,
  });

  await engine.loadAndPlay(t.streamUrl, (st: any) => {
    if (!st?.isLoaded) return;

    set({
      positionMs: st.positionMillis ?? 0,
      durationMs: st.durationMillis ?? 0,
      isPlaying: st.isPlaying ?? false,
    });

    // ★ここが自動Next
    if (st.didJustFinish) {
      // ここは await できないのでthenでOK
      get().next().catch(() => {});
    }
  });
},

  toggle: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await engine.pause();
      set({ isPlaying: false });
    } else {
      await engine.resume();
      set({ isPlaying: true });
    }
  },

  next: async () => {
    const { queue, index } = get();
    const i = Math.min(index + 1, queue.length - 1);
    if (i === index) return;
    await get().playAt(i);
  },

  prev: async () => {
    const { index } = get();
    const i = Math.max(index - 1, 0);
    if (i === index) return;
    await get().playAt(i);
  },

  seek: async (ms) => {
    await engine.seek(ms);
    set({ positionMs: ms });
  },

  tick: async () => {
    const st = await engine.getStatus();
    if (!st || !st.isLoaded) return;

    set({
      positionMs: st.positionMillis ?? 0,
      durationMs: st.durationMillis ?? 0,
      isPlaying: st.isPlaying ?? false,
    });
  },

  enqueueNext: async (track) => {
  const { current, queue, index } = get();

  // まだ何も再生してないなら、その曲を即再生扱いにする
  if (!current || queue.length === 0) {
    set({ queue: [track], index: 0 });
    await get().playAt(0);
    return;
  }

  const nextIndex = index + 1;
  const newQueue = [
    ...queue.slice(0, nextIndex),
    track,
    ...queue.slice(nextIndex),
  ];
  set({ queue: newQueue });
},

enqueueLast: async (track) => {
  const { current, queue } = get();

  // まだ何も再生してないなら、その曲を即再生扱いにする
  if (!current || queue.length === 0) {
    set({ queue: [track], index: 0 });
    await get().playAt(0);
    return;
  }

  set({ queue: [...queue, track] });
},
jumpTo: async (i) => {
  const { queue } = get();
  if (!queue[i]) return;
  await get().playAt(i);
},

removeAt: (i) => {
  const { queue, index } = get();
  if (i < 0 || i >= queue.length) return;

  // 再生中の曲より前を消したら index を1つ戻す
  if (i < index) {
    const newQueue = queue.filter((_, idx) => idx !== i);
    set({ queue: newQueue, index: index - 1 });
    return;
  }

  // 再生中の曲を消したら：いったん current を外して次へ（or 停止）
  if (i === index) {
    const newQueue = queue.filter((_, idx) => idx !== i);

    // 次の曲が残っていればそれを再生、なければ停止扱い
    set({ queue: newQueue, current: newQueue[index] ?? undefined, isPlaying: false });

    // ここは「次があれば再生」したいので軽く処理
    if (newQueue[index]) {
      // ※awaitできないのでthen
      get().playAt(index).catch(() => {});
    } else if (newQueue[index - 1]) {
      set({ index: index - 1 });
      get().playAt(index - 1).catch(() => {});
    } else {
      set({ index: 0, current: undefined, positionMs: 0, durationMs: 0 });
    }
    return;
  }

  // 再生中より後を消すだけ
  const newQueue = queue.filter((_, idx) => idx !== i);
  set({ queue: newQueue });
},

clearQueue: async () => {
  // 音は止めたいので、今の曲をPause → 状態クリア
  await get().toggle().catch(() => {}); // 再生中なら止める
  set({
    queue: [],
    index: 0,
    current: undefined,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  });
},

}));

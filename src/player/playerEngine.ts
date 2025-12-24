import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

export async function loadAndPlay(url: string, onStatus?: (status: any) => void) {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });

  if (sound) {
    try { await sound.unloadAsync(); } catch {}
    sound = null;
  }

  const { sound: s } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true }
  );

  if (onStatus) {
    s.setOnPlaybackStatusUpdate(onStatus);
  }

  sound = s;
}

export async function pause() {
  if (sound) await sound.pauseAsync();
}

export async function resume() {
  if (sound) await sound.playAsync();
}

export async function seek(ms: number) {
  if (sound) await sound.setPositionAsync(ms);
}

export async function getStatus() {
  if (!sound) return null;
  return await sound.getStatusAsync();
}

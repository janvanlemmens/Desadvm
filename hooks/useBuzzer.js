// hooks/useBuzzer.js

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";

export function useBuzzer() {
  // Provide the sound asset
  // `useAudioPlayer` returns an AudioPlayer instance
  const player = useAudioPlayer(require("../assets/sounds/buzzer-wrong.mp3"));

  // `player.play()` will play from current position; you may need to reset it
  const buzz = async () => {
    if (!player) return;
    // In expo-audio, after play completes, position stays at end,
    // so we should reset (seek to 0) before playing again:
    await player.seekTo(0);
    await player.play();
  };

  return { buzz };
}

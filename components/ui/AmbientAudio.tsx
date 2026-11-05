'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function AmbientAudio() {
  const musicVolume = useGameStore((s) => s.musicVolume);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = musicVolume / 100;
    if (musicVolume === 0) {
      audio.pause();
      return;
    }

    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException) {
        if (error.name === 'AbortError' || error.name === 'NotAllowedError') return;
      }
      console.error('Não foi possível reproduzir o áudio ambiente.', error);
    });
  }, [musicVolume]);

  return <audio id="ambient-audio" ref={audioRef} src="/musica_capa.mpeg" autoPlay loop preload="auto" />;
}

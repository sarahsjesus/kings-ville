'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const GAME_MUSIC = [
  '/musica2.mpeg',
  '/musica3.mpeg',
  '/musica4.mpeg',
  '/musica5.mpeg',
  '/musica6.mpeg',
];
const CROSSFADE_SECONDS = 3;
const CROSSFADE_MS = CROSSFADE_SECONDS * 1000;

type AudioGains = { intro: number; tracks: [number, number] };

export default function AmbientAudio() {
  const musicVolume = useGameStore((s) => s.musicVolume);
  const isPlaying = useGameStore((s) => s.phase === 'playing');
  const introRef = useRef<HTMLAudioElement>(null);
  const firstTrackRef = useRef<HTMLAudioElement>(null);
  const secondTrackRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(musicVolume);
  const gainsRef = useRef<AudioGains>({ intro: 1, tracks: [0, 0] });

  useEffect(() => {
    volumeRef.current = musicVolume;
    const masterVolume = musicVolume / 100;
    if (introRef.current) introRef.current.volume = gainsRef.current.intro * masterVolume;
    if (firstTrackRef.current) firstTrackRef.current.volume = gainsRef.current.tracks[0] * masterVolume;
    if (secondTrackRef.current) secondTrackRef.current.volume = gainsRef.current.tracks[1] * masterVolume;
  }, [musicVolume]);

  useEffect(() => {
    const intro = introRef.current;
    const tracks = [firstTrackRef.current, secondTrackRef.current] as const;
    if (!intro || !tracks[0] || !tracks[1]) return;

    const gameTracks = [tracks[0], tracks[1]] as const;
    const setGain = (slot: 'intro' | 0 | 1, value: number) => {
      const masterVolume = volumeRef.current / 100;
      if (slot === 'intro') {
        gainsRef.current.intro = value;
        intro.volume = value * masterVolume;
      } else {
        gainsRef.current.tracks[slot] = value;
        gameTracks[slot].volume = value * masterVolume;
      }
    };
    const play = (audio: HTMLAudioElement) => {
      void audio.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Não foi possível reproduzir a música.', error);
      });
    };

    if (!isPlaying) {
      gameTracks.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      setGain(0, 0);
      setGain(1, 0);
      setGain('intro', 1);
      play(intro);
      return;
    }

    let stopped = false;
    let animationFrame = 0;
    let activeSlot: 0 | 1 = 0;
    let currentTrack = 0;
    let transitioning = false;
    const initialTrack = gameTracks[activeSlot];

    const animateGains = (
      changes: Array<{ slot: 'intro' | 0 | 1; from: number; to: number }>,
      duration: number,
      onComplete: () => void,
    ) => {
      const start = performance.now();
      const animate = (now: number) => {
        if (stopped) return;
        const progress = Math.min((now - start) / duration, 1);
        changes.forEach(({ slot, from, to }) => setGain(slot, from + (to - from) * progress));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      };
      animationFrame = requestAnimationFrame(animate);
    };

    const startNextTrack = () => {
      if (stopped || transitioning) return;
      transitioning = true;
      const nextSlot = (1 - activeSlot) as 0 | 1;
      const nextTrack = (currentTrack + 1) % GAME_MUSIC.length;
      const nextAudio = gameTracks[nextSlot];
      nextAudio.src = GAME_MUSIC[nextTrack];
      nextAudio.load();
      setGain(nextSlot, 0);
      void nextAudio.play().then(() => {
        if (stopped) {
          nextAudio.pause();
          return;
        }
        animateGains(
          [
            { slot: activeSlot, from: gainsRef.current.tracks[activeSlot], to: 0 },
            { slot: nextSlot, from: 0, to: 1 },
          ],
          CROSSFADE_MS,
          () => {
            const previousAudio = gameTracks[activeSlot];
            previousAudio.pause();
            previousAudio.currentTime = 0;
            activeSlot = nextSlot;
            currentTrack = nextTrack;
            transitioning = false;
          },
        );
      }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        transitioning = false;
        console.error('Não foi possível reproduzir a próxima faixa.', error);
      });
    };

    const checkForCrossfade = () => {
      const activeAudio = gameTracks[activeSlot];
      const remaining = activeAudio.duration - activeAudio.currentTime;
      if (Number.isFinite(remaining) && remaining <= CROSSFADE_SECONDS) startNextTrack();
    };
    const handleEnded = (event: Event) => {
      if (event.currentTarget === gameTracks[activeSlot]) startNextTrack();
    };

    initialTrack.src = GAME_MUSIC[0];
    initialTrack.load();
    setGain('intro', 1);
    setGain(0, 0);
    setGain(1, 0);
    gameTracks.forEach((audio) => {
      audio.addEventListener('timeupdate', checkForCrossfade);
      audio.addEventListener('ended', handleEnded);
    });
    play(initialTrack);
    animateGains(
      [
        { slot: 'intro', from: 1, to: 0 },
        { slot: 0, from: 0, to: 1 },
      ],
      CROSSFADE_MS,
      () => {
        intro.pause();
        intro.currentTime = 0;
      },
    );

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      gameTracks.forEach((audio) => {
        audio.removeEventListener('timeupdate', checkForCrossfade);
        audio.removeEventListener('ended', handleEnded);
      });
      gameTracks.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [isPlaying]);

  return (
    <>
      <audio id="ambient-audio" ref={introRef} src="/musica_capa.mpeg" autoPlay loop preload="auto" />
      <audio ref={firstTrackRef} preload="auto" />
      <audio ref={secondTrackRef} preload="auto" />
    </>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";

const SAMPLE_PHRASES: Record<string, string> = {
  en: "Hello, I'm your AI assistant. How can I help you today?",
  es: "Hola, soy tu asistente de inteligencia artificial. ¿En qué puedo ayudarte hoy?",
  fr: "Bonjour, je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?",
  de: "Hallo, ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
  it: "Ciao, sono il tuo assistente AI. Come posso aiutarti oggi?",
  pt: "Olá, sou seu assistente de IA. Como posso ajudá-lo hoje?",
  pl: "Cześć, jestem twoim asystentem AI. Jak mogę ci dzisiaj pomóc?",
  hi: "नमस्ते, मैं आपका AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
  ar: "مرحباً، أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
  cs: "Dobrý den, jsem váš AI asistent. Jak vám mohu dnes pomoci?",
  da: "Hej, jeg er din AI-assistent. Hvordan kan jeg hjælpe dig i dag?",
  nl: "Hallo, ik ben uw AI-assistent. Hoe kan ik u vandaag helpen?",
  fi: "Hei, olen tekoälyavustajasi. Kuinka voin auttaa sinua tänään?",
  el: "Γεια σας, είμαι ο βοηθός AI σας. Πώς μπορώ να σας βοηθήσω σήμερα;",
  hu: "Helló, én vagyok az AI asszisztensed. Miben segíthetek ma?",
  id: "Halo, saya asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?",
  ja: "こんにちは、AIアシスタントです。今日はどのようにお手伝いできますか？",
  ko: "안녕하세요, 저는 AI 어시스턴트입니다. 오늘 어떻게 도와드릴까요?",
  ms: "Hai, saya pembantu AI anda. Bagaimana saya boleh membantu anda hari ini?",
  no: "Hei, jeg er din AI-assistent. Hvordan kan jeg hjelpe deg i dag?",
  ro: "Bună, sunt asistentul tău AI. Cum te pot ajuta astăzi?",
  ru: "Здравствуйте, я ваш AI-ассистент. Чем могу помочь сегодня?",
  sk: "Dobrý deň, som váš AI asistent. Ako vám môžem dnes pomôcť?",
  sv: "Hej, jag är din AI-assistent. Hur kan jag hjälpa dig idag?",
  ta: "வணக்கம், நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  tr: "Merhaba, ben yapay zeka asistanınızım. Bugün size nasıl yardımcı olabilirim?",
  uk: "Привіт, я ваш AI-асистент. Чим можу допомогти сьогодні?",
  vi: "Xin chào, tôi là trợ lý AI của bạn. Hôm nay tôi có thể giúp gì cho bạn?",
  zh: "你好，我是你的AI助手。今天我能帮你什么？",
};

export function getSamplePhrase(languageCode: string): string {
  return SAMPLE_PHRASES[languageCode] || SAMPLE_PHRASES["en"];
}

interface UseVoicePreviewOptions {
  apiBase?: string;
}

export function useVoicePreview(options: UseVoicePreviewOptions = {}) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resolvedApiBase = options.apiBase || `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      const src = audioRef.current.src;
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
      if (src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setPlayingKey(null);
    setLoadingKey(null);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const play = useCallback(async (key: string, language: string, voiceId?: string) => {
    if (playingKey === key) {
      stop();
      return;
    }

    stop();

    setLoadingKey(key);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const text = getSamplePhrase(language);

      const body: Record<string, unknown> = { text, language };
      if (voiceId) {
        body.voiceId = voiceId;
      }

      const response = await fetch(`${resolvedApiBase}/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize voice preview");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingKey(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setPlayingKey(null);
        setLoadingKey(null);
        audioRef.current = null;
      };

      setLoadingKey(null);
      setPlayingKey(key);
      await audio.play();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setLoadingKey(null);
      setPlayingKey(null);
      throw err;
    }
  }, [playingKey, stop, resolvedApiBase]);

  return { play, stop, playingKey, loadingKey, isPlaying: playingKey !== null, isLoading: loadingKey !== null };
}

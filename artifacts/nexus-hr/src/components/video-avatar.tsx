import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { EmotionState } from "@/components/ai-avatar";

interface VideoAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  emotion?: EmotionState;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  audioAnalyser?: AnalyserNode | null;
  className?: string;
}

interface FaceState {
  mouthOpen: number;
  mouthWidth: number;
  eyeOpenL: number;
  eyeOpenR: number;
  browOffsetL: number;
  browOffsetR: number;
  headTiltX: number;
  headTiltY: number;
  pupilX: number;
  pupilY: number;
}

const EMOTION_FACE_PARAMS: Record<EmotionState, Partial<FaceState>> = {
  neutral: {},
  enthusiastic: { browOffsetL: -3, browOffsetR: -3, mouthWidth: 1.2, eyeOpenL: 1.1, eyeOpenR: 1.1 },
  empathetic: { browOffsetL: 2, browOffsetR: 2, headTiltX: 3, eyeOpenL: 1.05, eyeOpenR: 1.05 },
  focused: { browOffsetL: 3, browOffsetR: 3, eyeOpenL: 0.85, eyeOpenR: 0.85, mouthWidth: 0.9 },
  reassuring: { browOffsetL: -1, browOffsetR: -1, mouthWidth: 1.1, headTiltX: -2 },
  apologetic: { browOffsetL: 4, browOffsetR: 4, headTiltX: -3, headTiltY: 2 },
  thoughtful: { browOffsetL: 2, browOffsetR: 0, headTiltX: 5, pupilX: 0.3, pupilY: -0.2 },
};

const EMOTION_COLORS: Record<EmotionState, string> = {
  neutral: "#a0855c",
  enthusiastic: "#f97316",
  empathetic: "#ec4899",
  focused: "#3b82f6",
  reassuring: "#22c55e",
  apologetic: "#a855f7",
  thoughtful: "#6366f1",
};

export function VideoAvatar({
  avatarUrl,
  name,
  emotion = "neutral",
  isSpeaking = false,
  isThinking = false,
  isListening = false,
  audioAnalyser,
  className,
}: VideoAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef = useRef(false);
  const faceStateRef = useRef<FaceState>({
    mouthOpen: 0, mouthWidth: 1, eyeOpenL: 1, eyeOpenR: 1,
    browOffsetL: 0, browOffsetR: 0, headTiltX: 0, headTiltY: 0,
    pupilX: 0, pupilY: 0,
  });
  const frameRef = useRef<number>(0);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(3000 + Math.random() * 4000);
  const gazeTRef = useRef(0);

  useEffect(() => {
    if (!avatarUrl) {
      imgLoadedRef.current = false;
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      imgLoadedRef.current = true;
    };
    img.onerror = () => {
      imgLoadedRef.current = false;
      imgRef.current = null;
    };
    img.src = avatarUrl;
  }, [avatarUrl]);

  const getAudioLevel = useCallback((): number => {
    if (!audioAnalyser) return 0;
    const data = new Uint8Array(audioAnalyser.frequencyBinCount);
    audioAnalyser.getByteFrequencyData(data);
    const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
    return avg / 255;
  }, [audioAnalyser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();
    const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "";

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const w = canvas.width;
      const h = canvas.height;
      const fs = faceStateRef.current;
      const emParams = EMOTION_FACE_PARAMS[emotion];
      const lerpSpeed = 4 * dt;

      let targetMouth = 0;
      if (isSpeaking) {
        const level = getAudioLevel();
        targetMouth = Math.min(1, level * 3.5);
        if (targetMouth < 0.05) {
          targetMouth = 0.15 + Math.sin(now * 0.012) * 0.1 + Math.sin(now * 0.007) * 0.08;
        }
      }

      fs.mouthOpen = lerp(fs.mouthOpen, targetMouth, lerpSpeed * 2);
      fs.mouthWidth = lerp(fs.mouthWidth, emParams.mouthWidth ?? 1, lerpSpeed);
      fs.browOffsetL = lerp(fs.browOffsetL, emParams.browOffsetL ?? 0, lerpSpeed);
      fs.browOffsetR = lerp(fs.browOffsetR, emParams.browOffsetR ?? 0, lerpSpeed);
      fs.headTiltX = lerp(fs.headTiltX, emParams.headTiltX ?? 0, lerpSpeed * 0.5);
      fs.headTiltY = lerp(fs.headTiltY, emParams.headTiltY ?? 0, lerpSpeed * 0.5);

      blinkTimerRef.current += dt * 1000;
      if (blinkTimerRef.current > nextBlinkRef.current) {
        blinkTimerRef.current = 0;
        nextBlinkRef.current = 2500 + Math.random() * 5000;
      }
      const blinkPhase = blinkTimerRef.current < 150 ? Math.sin((blinkTimerRef.current / 150) * Math.PI) : 0;
      const targetEyeL = (emParams.eyeOpenL ?? 1) * (1 - blinkPhase * 0.95);
      const targetEyeR = (emParams.eyeOpenR ?? 1) * (1 - blinkPhase * 0.95);
      fs.eyeOpenL = lerp(fs.eyeOpenL, targetEyeL, 15 * dt);
      fs.eyeOpenR = lerp(fs.eyeOpenR, targetEyeR, 15 * dt);

      gazeTRef.current += dt;
      const gazeBase = emParams.pupilX ?? 0;
      const gazeYBase = emParams.pupilY ?? 0;
      fs.pupilX = lerp(fs.pupilX, gazeBase + Math.sin(gazeTRef.current * 0.5) * 0.15, lerpSpeed * 0.3);
      fs.pupilY = lerp(fs.pupilY, gazeYBase + Math.cos(gazeTRef.current * 0.3) * 0.1, lerpSpeed * 0.3);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.46;

      ctx.save();
      ctx.translate(cx, cy);
      const breathe = Math.sin(now * 0.0008) * 0.003;
      const headNod = isSpeaking ? Math.sin(now * 0.003) * 0.005 : 0;
      ctx.scale(1 + breathe, 1 + breathe + headNod);
      ctx.rotate((fs.headTiltX * Math.PI) / 180 * 0.15);
      ctx.translate(0, fs.headTiltY * 0.5);
      ctx.translate(-cx, -cy);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgLoadedRef.current && imgRef.current) {
        const img = imgRef.current;
        const imgAspect = img.width / img.height;
        const boxSize = radius * 2;
        let drawW: number, drawH: number;
        if (imgAspect > 1) {
          drawH = boxSize;
          drawW = boxSize * imgAspect;
        } else {
          drawW = boxSize;
          drawH = boxSize / imgAspect;
        }
        ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
      } else {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, "#2a2520");
        grad.addColorStop(1, "#1a1510");
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.fillStyle = EMOTION_COLORS[emotion];
        ctx.font = `bold ${radius * 0.6}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, cx, cy - radius * 0.05);
      }

      const overlayAlpha = imgLoadedRef.current ? 0.55 : 0;
      if (overlayAlpha > 0) {
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha * 0.15})`;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }

      const eyeY = cy - radius * 0.12;
      const eyeSpacing = radius * 0.28;
      const eyeBaseW = radius * 0.12;
      const eyeBaseH = radius * 0.08;
      const pupilR = radius * 0.035;

      const drawEye = (ex: number, openness: number) => {
        const eyeH = eyeBaseH * openness;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeBaseW, Math.max(eyeH, 0.5), 0, 0, Math.PI * 2);
        ctx.fill();

        if (openness > 0.15) {
          ctx.fillStyle = "#1a1008";
          ctx.beginPath();
          ctx.arc(ex + fs.pupilX * eyeBaseW * 0.5, eyeY + fs.pupilY * eyeH * 0.3, pupilR * openness, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.beginPath();
          ctx.arc(ex + fs.pupilX * eyeBaseW * 0.3 - pupilR * 0.3, eyeY - pupilR * 0.4, pupilR * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawEye(cx - eyeSpacing, fs.eyeOpenL);
      drawEye(cx + eyeSpacing, fs.eyeOpenR);

      const browY = eyeY - radius * 0.12;
      const browW = eyeBaseW * 1.3;
      ctx.strokeStyle = "rgba(80,60,40,0.5)";
      ctx.lineWidth = radius * 0.02;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - browW, browY + fs.browOffsetL);
      ctx.quadraticCurveTo(cx - eyeSpacing, browY + fs.browOffsetL - 3, cx - eyeSpacing + browW, browY + fs.browOffsetL + 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing - browW, browY + fs.browOffsetR + 1);
      ctx.quadraticCurveTo(cx + eyeSpacing, browY + fs.browOffsetR - 3, cx + eyeSpacing + browW, browY + fs.browOffsetR);
      ctx.stroke();

      const mouthY = cy + radius * 0.28;
      const mouthW = radius * 0.2 * fs.mouthWidth;
      const mouthH = radius * 0.16 * fs.mouthOpen;

      if (fs.mouthOpen > 0.02) {
        ctx.fillStyle = "rgba(60,20,15,0.8)";
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, mouthW, Math.max(mouthH, 1), 0, 0, Math.PI * 2);
        ctx.fill();

        if (mouthH > radius * 0.04) {
          ctx.fillStyle = "rgba(180,60,60,0.4)";
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + mouthH * 0.3, mouthW * 0.5, mouthH * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = "rgba(100,60,50,0.5)";
        ctx.lineWidth = radius * 0.015;
        ctx.beginPath();
        ctx.moveTo(cx - mouthW, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + 2, cx + mouthW, mouthY);
        ctx.stroke();
      }

      ctx.restore();

      const accentColor = EMOTION_COLORS[emotion];
      const ringW = 3;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = ringW;
      ctx.globalAlpha = 0.6;

      if (isSpeaking) {
        const pulseScale = 1 + Math.sin(now * 0.006) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * pulseScale + 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.15 + fs.mouthOpen * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 10 + fs.mouthOpen * 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isThinking) {
        const dashOffset = now * 0.03;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = dashOffset;
        ctx.strokeStyle = "#eab308";
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isListening) {
        const listenPulse = 1 + Math.sin(now * 0.005) * 0.015;
        ctx.strokeStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(cx, cy, radius * listenPulse + 4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      if (isSpeaking) {
        const barCount = 7;
        const barSpacing = radius * 0.08;
        const barW = 3;
        const barBaseY = cy + radius + 16;
        ctx.fillStyle = accentColor;
        for (let i = 0; i < barCount; i++) {
          const x = cx + (i - (barCount - 1) / 2) * barSpacing;
          const h = 4 + fs.mouthOpen * 14 * (0.5 + Math.sin(now * 0.008 + i * 0.7) * 0.5);
          ctx.globalAlpha = 0.7;
          ctx.fillRect(x - barW / 2, barBaseY - h, barW, h);
        }
        ctx.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [emotion, isSpeaking, isThinking, isListening, getAudioLevel, name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
    });
    observer.observe(canvas);
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      style={{ imageRendering: "auto" }}
    />
  );
}

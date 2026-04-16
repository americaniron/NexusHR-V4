import { useListConversations, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/react";
import { AIAvatar } from "@/components/ai-avatar";
import type { AvatarVisualState, EmotionState } from "@/components/ai-avatar";
import { AvatarAnimator } from "@/components/avatar-animator";
import type { VisemeData } from "@/components/avatar-animator";
import { ChatMessage } from "@/components/chat-messages";
import type { ChatMessageData } from "@/components/chat-messages";
import { CsatSurvey } from "@/components/csat-survey";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageSquare, Mic, MicOff, PhoneOff, ChevronLeft, Video, Film, Play, Trash2, Clock, Loader2 } from "lucide-react";
import { useVoiceMode } from "@/hooks/use-voice-mode";
import { useVideoCall } from "@/hooks/use-video-call";
import { VideoCallSession } from "@/components/video-call-session";
import { RecordingPlayback } from "@/components/recording-playback";
import { useToast } from "@/hooks/use-toast";

function formatRecordingDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ConversationsPage() {
  const { data: convList } = useListConversations({ limit: 50 });
  const [activeId, setActiveId] = useState<number | null>(null);
  const [autoVideoCall, setAutoVideoCall] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agentId = params.get("agentId");
    const videoCall = params.get("videoCall") === "true";

    if (agentId && convList?.data?.length) {
      const agentConv = convList.data.find(c => c.aiEmployee?.id === parseInt(agentId, 10));
      if (agentConv) {
        setActiveId(agentConv.id);
        if (videoCall) {
          setAutoVideoCall(true);
        }
      }
    } else if (convList?.data?.length && !activeId) {
      setActiveId(convList.data[0].id);
    }
  }, [convList, activeId]);

  return (
    <div className="flex h-[calc(100vh-140px)] border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className={`${activeId ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 border-r border-border flex-col bg-muted/10`}>
        <div className="p-4 border-b border-border bg-card font-semibold text-foreground flex items-center justify-between">
          <span>Conversations</span>
          {convList?.data && (
            <Badge variant="secondary" className="text-xs">{convList.data.length}</Badge>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {convList?.data?.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeId === conv.id ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-muted/50'
                }`}
              >
                <div className="relative shrink-0">
                  <AIAvatar src={conv.aiEmployee?.avatarUrl} name={conv.aiEmployee?.name} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {conv.aiEmployee?.name || "AI Professional"}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {"updatedAt" in conv && conv.updatedAt ? new Date(String(conv.updatedAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conv.title || "New Conversation"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {activeId ? (
          <div className="flex flex-col flex-1">
            <button onClick={() => setActiveId(null)} className="sm:hidden flex items-center gap-2 p-3 border-b border-border text-sm text-muted-foreground hover:text-foreground" aria-label="Back to conversation list">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <ChatWindow conversationId={activeId} autoStartVideoCall={autoVideoCall} onVideoCallAutoStarted={() => setAutoVideoCall(false)} />
          </div>
        ) : (
          <div className={`${activeId ? '' : 'hidden sm:flex'} flex-1 items-center justify-center text-muted-foreground flex-col`}>
            <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/30" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ conversationId, autoStartVideoCall, onVideoCallAutoStarted }: { conversationId: number; autoStartVideoCall?: boolean; onVideoCallAutoStarted?: () => void }) {
  const { data: conv, isLoading, refetch } = useGetConversation(conversationId);
  const sendMutation = useSendMessage();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [aiAvatarState, setAiAvatarState] = useState<AvatarVisualState>("idle");
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>("neutral");
  const [activeVisemes, setActiveVisemes] = useState<VisemeData[]>([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showCsatSurvey, setShowCsatSurvey] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showRecordings, setShowRecordings] = useState(false);
  const [recordings, setRecordings] = useState<Array<{id: number; sessionId: string; title?: string; durationMs?: number; sizeBytes?: number; mimeType: string; createdAt: string}>>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState<number | null>(null);

  const voiceMode = useVoiceMode({
    onTranscription: (text) => {
      if (text.trim()) {
        setInput(text);
        handleSendText(text);
      }
    },
    onPartialTranscript: (text) => {
      if (text.trim()) {
        setInput(text);
      }
    },
    onError: (error) => {
      toast({ title: "Voice Error", description: error, variant: "destructive" });
    },
    onEmotionChange: (emotion) => {
      setCurrentEmotion(emotion);
      setTimeout(() => setCurrentEmotion("neutral"), 8000);
    },
    onVisemesReady: (visemes) => {
      setActiveVisemes(visemes);
    },
  });

  const videoCall = useVideoCall({
    conversationId,
    employeeId: conv?.aiEmployee?.id,
    getToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
    onTranscription: (text) => {
      if (text.trim()) {
        handleSendText(text);
      }
    },
    onStatusChange: (status) => {
      if (status === "connected") {
        toast({ title: "Video Call Connected", description: `Connected to ${conv?.aiEmployee?.name}` });
      }
    },
    onError: (error) => {
      toast({ title: "Video Call Error", description: error, variant: "destructive" });
    },
    onFallbackToVoice: () => {
      toast({
        title: "Switched to Voice Mode",
        description: "Video call connection failed. Falling back to voice mode.",
      });
      if (!voiceMode.isVoiceMode) {
        voiceMode.toggleVoiceMode();
      }
    },
    apiBase: `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/"),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conv?.messages]);

  const handleSendText = useCallback(async (text: string) => {
    if (!text.trim() || sendMutation.isPending) return;

    setInput("");
    setAiAvatarState("thinking");

    try {
      await sendMutation.mutateAsync({ id: conversationId, data: { content: text } });
      const refreshed = await refetch();

      if (refreshed.data) {
        const msgs = refreshed.data.messages;
        if (msgs && msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg?.role === "assistant" && lastMsg.metadata) {
            const meta = lastMsg.metadata as Record<string, unknown>;
            if (meta.emotion) {
              setCurrentEmotion(meta.emotion as EmotionState);
              setTimeout(() => setCurrentEmotion("neutral"), 8000);
            }
          }
        }
      }

      setAiAvatarState("idle");

      setMessageCount(prev => {
        const next = prev + 1;
        if (next >= 5 && next % 5 === 0) {
          setShowCsatSurvey(true);
        }
        return next;
      });

      const shouldSynthesize = voiceMode.isVoiceMode || isVideoCallActive;
      if (shouldSynthesize && refreshed.data) {
        const messages = refreshed.data.messages;
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg?.role === "assistant" && lastMsg?.content) {
            if (isVideoCallActive) {
              setAiAvatarState("speaking");
              const response = await fetch("/api/voice/synthesize-aligned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  text: lastMsg.content,
                  voiceId: refreshed.data.aiEmployee?.voiceId || undefined,
                }),
              });
              if (response.ok) {
                const data = await response.json();
                if (data.emotion) {
                  setCurrentEmotion(data.emotion as EmotionState);
                }
                if (data.audio) {
                  videoCall.sendTtsAudio(data.audio);
                }
              }
            } else {
              await voiceMode.synthesizeAndPlay(
                lastMsg.content,
                refreshed.data.aiEmployee?.voiceId || undefined,
              );
            }
          }
        }
      }
    } catch {
      setAiAvatarState("idle");
      setInput(text);
    }
  }, [conversationId, sendMutation, refetch, voiceMode, isVideoCallActive, videoCall]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await handleSendText(input);
  };

  const handleQuickReply = useCallback((reply: string) => {
    handleSendText(reply);
  }, [handleSendText]);

  const handleActionApprove = useCallback(async (actionId: string) => {
    try {
      const msgId = parseInt(actionId);
      if (isNaN(msgId)) return;

      const response = await fetch(`/api/conversations/${conversationId}/confirm-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: msgId, action: "approve" }),
      });

      if (response.ok) {
        toast({ title: "Task Created", description: "A new task has been created from this conversation." });
        refetch();
      }
    } catch {
      toast({ title: "Error", description: "Failed to confirm task creation.", variant: "destructive" });
    }
  }, [conversationId, refetch, toast]);

  const handleActionReject = useCallback(async (actionId: string) => {
    try {
      const msgId = parseInt(actionId);
      if (isNaN(msgId)) return;

      const response = await fetch(`/api/conversations/${conversationId}/confirm-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: msgId, action: "reject" }),
      });

      if (response.ok) {
        refetch();
      }
    } catch {
      toast({ title: "Error", description: "Failed to decline task.", variant: "destructive" });
    }
  }, [conversationId, refetch, toast]);

  const handleVoiceToggle = async () => {
    if (voiceMode.isRecording) {
      setAiAvatarState("thinking");
      await voiceMode.stopRecording();
    } else if (voiceMode.isVoiceMode) {
      await voiceMode.startRecording();
      setAiAvatarState("listening");
    }
  };

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const fetchRecordings = useCallback(async () => {
    setLoadingRecordings(true);
    try {
      const response = await fetch(`${apiBase}/video-call/recordings?conversationId=${conversationId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      }
    } catch {
      console.error("[Recordings] Failed to fetch recordings");
    } finally {
      setLoadingRecordings(false);
    }
  }, [conversationId, apiBase]);

  const deleteRecording = useCallback(async (recordingId: number) => {
    try {
      const response = await fetch(`${apiBase}/video-call/recordings/${recordingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
        if (playingRecordingId === recordingId) {
          setPlayingRecordingId(null);
        }
        toast({ title: "Recording Deleted", description: "The recording has been removed." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete recording.", variant: "destructive" });
    }
  }, [apiBase, playingRecordingId, toast]);

  useEffect(() => {
    if (showRecordings) {
      fetchRecordings();
    }
  }, [showRecordings, fetchRecordings]);

  const handleVideoCallToggle = async () => {
    if (isVideoCallActive) {
      videoCall.endCall();
      setIsVideoCallActive(false);
    } else {
      if (voiceMode.isVoiceMode) {
        await voiceMode.toggleVoiceMode();
      }
      setIsVideoCallActive(true);
      await videoCall.startCall();
    }
  };

  const handleVideoCallEnd = () => {
    videoCall.endCall();
    setIsVideoCallActive(false);
  };

  useEffect(() => {
    if (voiceMode.isRecording) {
      setAiAvatarState("listening");
    } else if (voiceMode.isTranscribing || voiceMode.isSynthesizing) {
      setAiAvatarState("thinking");
    } else if (voiceMode.isPlayingAudio) {
      setAiAvatarState("speaking");
    } else if (!sendMutation.isPending) {
      setAiAvatarState("idle");
    }
  }, [voiceMode.isRecording, voiceMode.isTranscribing, voiceMode.isSynthesizing, voiceMode.isPlayingAudio, sendMutation.isPending]);

  useEffect(() => {
    if (videoCall.status === "ended" || videoCall.status === "failed") {
      setIsVideoCallActive(false);
    }
  }, [videoCall.status]);

  useEffect(() => {
    if (autoStartVideoCall && conv && !isVideoCallActive && videoCall.status === "idle") {
      setIsVideoCallActive(true);
      videoCall.startCall();
      onVideoCallAutoStarted?.();
    }
  }, [autoStartVideoCall, conv, isVideoCallActive, videoCall.status]);

  useEffect(() => {
    if (isVideoCallActive) {
      if (videoCall.isTtsSpeaking) {
        setAiAvatarState("speaking");
      } else if (!sendMutation.isPending && aiAvatarState === "speaking") {
        setAiAvatarState("idle");
      }
    }
  }, [videoCall.isTtsSpeaking, isVideoCallActive, sendMutation.isPending, aiAvatarState]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!conv) return null;

  if (isVideoCallActive && (videoCall.status === "connecting" || videoCall.status === "connected" || videoCall.status === "reconnecting" || videoCall.status === "failed")) {
    return (
      <div className="flex flex-col flex-1">
        <VideoCallSession
          status={videoCall.status}
          localStream={videoCall.localStream}
          ttsAudioAnalyser={videoCall.ttsAudioAnalyser}
          isMuted={videoCall.isMuted}
          isCameraOff={videoCall.isCameraOff}
          connectionQuality={videoCall.connectionQuality}
          latencyMs={videoCall.latencyMs}
          avatarUrl={conv.aiEmployee?.avatarUrl}
          avatarName={conv.aiEmployee?.name}
          emotion={currentEmotion}
          isSpeaking={aiAvatarState === "speaking"}
          isThinking={aiAvatarState === "thinking"}
          isListening={aiAvatarState === "listening" || videoCall.isRecording}
          isRecording={videoCall.isRecording}
          isTranscribing={videoCall.isTranscribing}
          isSessionRecording={videoCall.isSessionRecording}
          isUploadingRecording={videoCall.isUploadingRecording}
          sessionRecordingDuration={videoCall.sessionRecordingDuration}
          onToggleMute={videoCall.toggleMute}
          onToggleCamera={videoCall.toggleCamera}
          onEndCall={handleVideoCallEnd}
          onStartRecording={videoCall.startRecording}
          onStopRecording={videoCall.stopRecording}
          onStartSessionRecording={videoCall.startSessionRecording}
          onStopSessionRecording={videoCall.stopSessionRecording}
          className="flex-1"
        />

        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${conv.aiEmployee?.name}...`}
              className="pr-12 h-12 bg-background border-border"
              disabled={sendMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 h-9 w-9"
              disabled={!input.trim() || sendMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          {voiceMode.isVoiceMode ? (
            <AvatarAnimator
              avatarUrl={conv.aiEmployee?.avatarUrl}
              name={conv.aiEmployee?.name}
              isActive={true}
              isSpeaking={aiAvatarState === "speaking"}
              isThinking={aiAvatarState === "thinking"}
              isListening={aiAvatarState === "listening"}
              emotion={currentEmotion}
              visemes={activeVisemes}
              audioLevel={voiceMode.audioLevel}
              className="h-10 w-10"
            />
          ) : (
            <AIAvatar
              src={conv.aiEmployee?.avatarUrl}
              name={conv.aiEmployee?.name}
              size="sm"
              visualState={aiAvatarState}
              audioLevel={voiceMode.audioLevel}
              emotion={currentEmotion}
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{conv.aiEmployee?.name}</span>
            {aiAvatarState !== "idle" && (
              <span className="text-xs text-muted-foreground capitalize">
                {aiAvatarState === "speaking" ? "Speaking..." : aiAvatarState === "thinking" ? "Thinking..." : aiAvatarState === "listening" ? "Listening..." : ""}
              </span>
            )}
            {aiAvatarState === "idle" && currentEmotion !== "neutral" && (
              <span className="text-xs text-muted-foreground capitalize">
                Feeling {currentEmotion}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showRecordings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRecordings(!showRecordings)}
            className="gap-1"
          >
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Recordings</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVideoCallToggle}
            disabled={voiceMode.isVoiceMode}
            className="gap-1"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video Call</span>
          </Button>
          <Button
            variant={voiceMode.isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={voiceMode.toggleVoiceMode}
            className={voiceMode.isVoiceMode ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {voiceMode.isVoiceMode ? (
              <><PhoneOff className="h-4 w-4 mr-1" /> End Voice</>
            ) : (
              <><Mic className="h-4 w-4 mr-1" /> Voice Mode</>
            )}
          </Button>
        </div>
      </div>

      {showRecordings && (
        <div className="border-b border-border bg-muted/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Film className="h-4 w-4" />
                Session Recordings
              </h3>
              <Button variant="ghost" size="sm" onClick={fetchRecordings} disabled={loadingRecordings} className="h-7 text-xs">
                {loadingRecordings ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
              </Button>
            </div>

            {playingRecordingId && (
              <div className="mb-3">
                <RecordingPlayback
                  src={`${apiBase}/video-call/recordings/${playingRecordingId}/stream`}
                  title={recordings.find(r => r.id === playingRecordingId)?.title || `Recording #${playingRecordingId}`}
                  duration={recordings.find(r => r.id === playingRecordingId)?.durationMs}
                  onClose={() => setPlayingRecordingId(null)}
                  className="max-h-[300px]"
                />
              </div>
            )}

            {loadingRecordings ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : recordings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No recordings yet. Use the record button during a video call to capture sessions.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {recordings.map(recording => (
                  <div
                    key={recording.id}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
                      playingRecordingId === recording.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-background border-border hover:bg-muted/50",
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setPlayingRecordingId(playingRecordingId === recording.id ? null : recording.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {recording.title || `Session Recording`}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recording.durationMs ? formatRecordingDuration(recording.durationMs) : "Unknown"}
                        </span>
                        <span>
                          {new Date(recording.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {recording.sizeBytes && (
                          <span>{(recording.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {conv.messages?.map((msg) => {
          const chatMsg: ChatMessageData = {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            messageType: msg.messageType as ChatMessageData["messageType"],
            metadata: msg.metadata as ChatMessageData["metadata"],
            audioUrl: msg.audioUrl,
            createdAt: msg.createdAt ? String(msg.createdAt) : undefined,
          };

          return (
            <ChatMessage
              key={msg.id}
              message={chatMsg}
              avatarUrl={conv.aiEmployee?.avatarUrl}
              avatarName={conv.aiEmployee?.name}
              conversationId={conversationId}
              aiEmployeeId={conv.aiEmployee?.id}
              onPlayStateChange={(playing) => {
                if (playing) {
                  setAiAvatarState("speaking");
                  const meta = chatMsg.metadata;
                  if (meta?.emotion) setCurrentEmotion(meta.emotion);
                } else {
                  setAiAvatarState("idle");
                }
              }}
              onQuickReply={handleQuickReply}
              onActionApprove={handleActionApprove}
              onActionReject={handleActionReject}
            />
          );
        })}

        {sendMutation.isPending && (
          <div className="flex gap-4">
            <AIAvatar
              src={conv.aiEmployee?.avatarUrl}
              name={conv.aiEmployee?.name}
              size="sm"
              visualState="thinking"
            />
            <div className="rounded-2xl px-4 py-2.5 bg-muted text-foreground rounded-tl-sm border border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-thinking-dot" style={{ animationDelay: "0s" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-thinking-dot" style={{ animationDelay: "0.3s" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-thinking-dot" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showCsatSurvey && conv.aiEmployee && (
        <CsatSurvey
          conversationId={conversationId}
          aiEmployeeId={conv.aiEmployee.id}
          employeeName={conv.aiEmployee.name}
          onDismiss={() => setShowCsatSurvey(false)}
        />
      )}

      <div className="p-4 border-t border-border bg-card">
        {voiceMode.isVoiceMode ? (
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={voiceMode.isRecording ? "destructive" : "default"}
              className={`h-14 w-14 rounded-full ${voiceMode.isRecording ? "animate-pulse" : ""}`}
              onClick={handleVoiceToggle}
              disabled={voiceMode.isTranscribing || voiceMode.isSynthesizing}
            >
              {voiceMode.isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <div className="text-sm text-muted-foreground">
              {voiceMode.isRecording
                ? "Listening... Click to stop"
                : voiceMode.isTranscribing
                ? "Transcribing..."
                : voiceMode.isSynthesizing
                ? "Generating voice..."
                : voiceMode.isPlayingAudio
                ? "Speaking..."
                : "Click to speak"}
            </div>
            {voiceMode.isRecording && (
              <div className="flex items-end gap-[2px] h-8">
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-green-500 rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, voiceMode.audioLevel * 32 * (0.5 + Math.random() * 0.5))}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${conv.aiEmployee?.name}...`}
              className="pr-12 h-12 bg-background border-border"
              disabled={sendMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 h-9 w-9"
              disabled={!input.trim() || sendMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </>
  );
}

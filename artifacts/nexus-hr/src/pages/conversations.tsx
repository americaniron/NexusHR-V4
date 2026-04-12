import { useListConversations, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AIAvatar } from "@/components/ai-avatar";
import type { AvatarVisualState } from "@/components/ai-avatar";
import { AudioWaveformPlayer } from "@/components/audio-waveform-player";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageSquare, Mic, MicOff, PhoneOff, ChevronLeft } from "lucide-react";
import { useVoiceMode } from "@/hooks/use-voice-mode";
import { useToast } from "@/hooks/use-toast";

export default function ConversationsPage() {
  const { data: convList } = useListConversations({ limit: 50 });
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (convList?.data?.length && !activeId) {
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
                      {conv.aiEmployee?.name || "AI Person"}
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
            <ChatWindow conversationId={activeId} />
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

function ChatWindow({ conversationId }: { conversationId: number }) {
  const { data: conv, isLoading, refetch } = useGetConversation(conversationId);
  const sendMutation = useSendMessage();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [aiAvatarState, setAiAvatarState] = useState<AvatarVisualState>("idle");

  const voiceMode = useVoiceMode({
    onTranscription: (text) => {
      if (text.trim()) {
        setInput(text);
        handleSendText(text);
      }
    },
    onError: (error) => {
      toast({ title: "Voice Error", description: error, variant: "destructive" });
    },
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

      setAiAvatarState("idle");

      if (voiceMode.isVoiceMode && refreshed.data) {
        const messages = refreshed.data.messages;
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg?.role === "assistant" && lastMsg?.content) {
            await voiceMode.synthesizeAndPlay(
              lastMsg.content,
              refreshed.data.aiEmployee?.voiceId || undefined,
            );
          }
        }
      }
    } catch {
      setAiAvatarState("idle");
      setInput(text);
    }
  }, [conversationId, sendMutation, refetch, voiceMode]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await handleSendText(input);
  };

  const handleVoiceToggle = async () => {
    if (voiceMode.isRecording) {
      setAiAvatarState("thinking");
      await voiceMode.stopRecording();
    } else if (voiceMode.isVoiceMode) {
      await voiceMode.startRecording();
      setAiAvatarState("listening");
    }
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

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!conv) return null;

  return (
    <>
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AIAvatar
            src={conv.aiEmployee?.avatarUrl}
            name={conv.aiEmployee?.name}
            size="sm"
            visualState={aiAvatarState}
            audioLevel={voiceMode.audioLevel}
          />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{conv.aiEmployee?.name}</span>
            {aiAvatarState !== "idle" && (
              <span className="text-xs text-muted-foreground capitalize">
                {aiAvatarState === "speaking" ? "Speaking..." : aiAvatarState === "thinking" ? "Thinking..." : aiAvatarState === "listening" ? "Listening..." : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {conv.messages?.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'user' ? (
              <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <AIAvatar
                src={conv.aiEmployee?.avatarUrl}
                name={conv.aiEmployee?.name}
                size="sm"
              />
            )}
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm border border-border/50'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.audioUrl && (
                <AudioWaveformPlayer
                  src={msg.audioUrl}
                  compact
                  className="mt-1"
                  onPlayStateChange={(playing) => {
                    if (playing) setAiAvatarState("speaking");
                    else setAiAvatarState("idle");
                  }}
                />
              )}
            </div>
          </div>
        ))}

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

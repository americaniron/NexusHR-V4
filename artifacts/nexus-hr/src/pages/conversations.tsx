import { useListConversations, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AIAvatar } from "@/components/ai-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Volume2, VolumeX, MessageSquare } from "lucide-react";

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
      <div className="w-80 border-r border-border flex flex-col bg-muted/10">
        <div className="p-4 border-b border-border bg-card font-semibold text-foreground">
          Conversations
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
                <AIAvatar src={conv.aiEmployee?.avatarUrl} name={conv.aiEmployee?.name} size="sm" />
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm text-foreground truncate">
                    {conv.aiEmployee?.name || "Agent"}
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
          <ChatWindow conversationId={activeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
            <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/30" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <button
      onClick={togglePlay}
      className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-md text-xs hover:bg-white/10 transition-colors"
      title={isPlaying ? "Stop audio" : "Play audio"}
    >
      {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {isPlaying ? "Stop" : "Listen"}
    </button>
  );
}

function ChatWindow({ conversationId }: { conversationId: number }) {
  const { data: conv, isLoading, refetch } = useGetConversation(conversationId);
  const sendMutation = useSendMessage();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conv?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;
    
    const text = input;
    setInput("");
    
    try {
      await sendMutation.mutateAsync({ id: conversationId, data: { content: text } });
      refetch();
    } catch (err) {
      console.error(err);
      setInput(text);
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!conv) return null;

  return (
    <>
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AIAvatar src={conv.aiEmployee?.avatarUrl} name={conv.aiEmployee?.name} size="sm" />
          <span className="font-medium text-foreground">{conv.aiEmployee?.name}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {conv.messages?.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <Avatar className="h-8 w-8 shrink-0 border border-border/50">
              <AvatarFallback className={msg.role === 'user' ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-muted text-foreground rounded-tl-sm border border-border/50'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && msg.audioUrl && (
                <AudioPlayer audioUrl={msg.audioUrl} />
              )}
            </div>
          </div>
        ))}
      </div>

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
    </>
  );
}

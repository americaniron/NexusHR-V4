import { useListConversations, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Mic } from "lucide-react";

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
      {/* Sidebar */}
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
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={conv.aiEmployee?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
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

      {/* Chat Area */}
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

function ChatWindow({ conversationId }: { conversationId: number }) {
  const { data: conv, isLoading, refetch } = useGetConversation(conversationId, { query: { enabled: !!conversationId } });
  const sendMutation = useSendMessage(conversationId);
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
      await sendMutation.mutateAsync({ data: { content: text } });
      refetch();
    } catch (err) {
      console.error(err);
      setInput(text); // restore on failure
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!conv) return null;

  return (
    <>
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={conv.aiEmployee?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{conv.aiEmployee?.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Mic className="h-5 w-5" />
        </Button>
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

import { MessageSquare } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  message_content: string;
  type: "Inbound" | "Outbound";
  status: "Sent" | "Received";
  created_at: string;
}

interface MessageThreadProps {
  messages: Message[];
  contactName: string;
  contactPhone: string;
}

export function MessageThread({
  messages,
  contactName,
  contactPhone,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const messageText = newMessage.trim();
    setIsSending(true);
    setNewMessage("");

    try {
      const response = await fetch(
        "https://n8n.veltraai.net/webhook/Manual-Message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactName,
            phone: contactPhone,
            message_content: messageText,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send");
      toast.success("Message sent successfully");
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="p-4 border-b border-border shrink-0 bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold text-foreground">{contactName}</h3>
        <p className="text-xs text-muted-foreground">{contactPhone}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.type === "Outbound";
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOutbound ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 animate-scale-in ${
                    isOutbound
                      ? "bg-[#3d330d] border border-[#f6ca15]/20 text-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isOutbound ? (
                      <Bot className="h-3 w-3 text-[#f6ca15]" />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isOutbound ? "System" : contactName}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message_content}
                  </p>
                  <p className="text-[10px] opacity-50 mt-1 text-right">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isSending}
            className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#f6ca15] outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            className="h-10 w-10 rounded-full bg-[#f6ca15] flex items-center justify-center text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

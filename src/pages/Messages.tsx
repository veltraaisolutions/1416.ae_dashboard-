import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContactList } from "@/components/messages/ContactList";
import { MessageThread } from "@/components/messages/MessageThread";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";

// 1. Define the Message Structure
interface Message {
  id: string;
  lead_id: number | null;
  name: string;
  phone: string;
  message_content: string;
  type: "Inbound" | "Outbound";
  status: "Sent" | "Received";
  created_at: string;
}

interface Contact {
  id: string; // Using Phone as the unique ID for grouping
  name: string;
  lastMessage?: string;
}

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // 2. Fetch all messages from the 1416_message_logs table
  const {
    data: messages,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["1416_message_logs"],
    staleTime: 1000 * 60 * 5, // 5 minute cache
    queryFn: async () => {
      const { data, error } = await supabase
        .from("1416_message_logs")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Message[]) ?? [];
    },
  });

  // 3. Realtime Listener: Automatically refresh when a new row is inserted
  useEffect(() => {
    const channel = supabase
      .channel("1416-messages-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "1416_message_logs",
        },
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // 4. Logic: Group raw messages into unique People/Contacts for the sidebar
  const contacts: Contact[] = messages
    ? Array.from(
        new Map(
          messages.map((m) => [
            m.phone,
            {
              id: m.phone,
              name: m.name || m.phone,
              lastMessage: m.message_content,
            },
          ]),
        ).values(),
      ).reverse() // Show newest conversations at the top
    : [];

  // Filter messages for the specific person selected
  const filteredMessages = selectedContact
    ? messages?.filter((msg) => msg.phone === selectedContact.id)
    : [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Message Logs
            </h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mt-1">
              Real-time WhatsApp Feed
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        {/* Main Dashboard UI */}
        <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-220px)] flex flex-col border border-border bg-card shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full min-h-0">
            {/* Sidebar: People List */}
            <div className="md:col-span-1 h-full min-h-0 border-r border-border overflow-y-auto bg-muted/5">
              <div className="p-4 border-b border-border bg-muted/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Conversations
                </p>
              </div>
              {contacts.length > 0 ? (
                <ContactList
                  contacts={contacts}
                  selectedId={selectedContact?.id}
                  onSelect={setSelectedContact}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30 grayscale">
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <p className="text-xs font-semibold uppercase">
                    No logs found
                  </p>
                </div>
              )}
            </div>

            {/* Main: Chat Thread (Handles its own Input/Webhook) */}
            <div className="md:col-span-2 h-full min-h-0 flex flex-col relative bg-muted/10">
              {selectedContact ? (
                <MessageThread
                  messages={filteredMessages || []}
                  contactName={selectedContact.name}
                  contactPhone={selectedContact.id}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground italic">
                    1416 Messenger
                  </h3>
                  <p className="text-sm max-w-xs mt-2">
                    Select a contact from the list to view their automated chat
                    history or send a manual reply.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

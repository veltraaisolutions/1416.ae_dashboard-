import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContactList } from "@/components/messages/ContactList";
import { MessageThread } from "@/components/messages/MessageThread";
import { Loader2, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  name: string;
  phone: string;
  message_content: string;
  type: "Inbound" | "Outbound";
  status: "Sent" | "Received";
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
}

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    data: messages,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["message_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maid_to_perfection_message_logs")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Message[]) ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "maid_to_perfection_message_logs",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const contacts: Contact[] = messages
    ? Array.from(
        new Map(
          messages.map((m) => [
            m.phone,
            {
              id: m.phone,
              name: m.name,
              lastMessage: m.message_content,
            },
          ])
        ).values()
      )
    : [];

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Message Logs</h1>
          <p className="text-muted-foreground">
            View automated WhatsApp conversations
          </p>
        </div>

        <div className="glass-card rounded-xl overflow-hidden h-[calc(100vh-220px)] flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full min-h-0">
            {/* Contact List Column */}
            <div className="md:col-span-1 h-full min-h-0 border-r border-border">
              <ContactList
                contacts={contacts}
                selectedId={selectedContact?.id}
                onSelect={setSelectedContact}
              />
            </div>

            {/* Message Thread Column */}
            <div className="md:col-span-2 h-full min-h-0 bg-background/20">
              {selectedContact ? (
                <MessageThread
                  messages={filteredMessages || []}
                  contactName={selectedContact.name}
                  contactPhone={selectedContact.id}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Choose a contact from the list to view their message history
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

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  unread?: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  selectedId?: string;
  onSelect: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  selectedId,
  onSelect,
}: ContactListProps) {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-border shrink-0">
        <h3 className="font-semibold text-foreground">Contacts</h3>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelect(contact)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left ${
              selectedId === contact.id
                ? "bg-primary/10 text-primary border-l-4 border-primary"
                : "hover:bg-muted text-foreground border-l-4 border-transparent"
            }`}
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
              {contact.name.charAt(0).toLowerCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm truncate text-left ${
                  selectedId === contact.id
                    ? "text-[#f6ca15]"
                    : "text-foreground"
                }`}
              >
                {contact.name.toLowerCase()}
              </p>

              {contact.lastMessage && (
                <p className="text-xs text-muted-foreground truncate text-left">
                  {contact.lastMessage}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

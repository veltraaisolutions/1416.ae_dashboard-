import { Clock, Home, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  ai_summary?: string;
  preferred_time?: string;
  property_details?: string;
  created_at: string;
}

interface EnquiryCardProps {
  lead: Lead;
  onApprove?: (lead: Lead) => void;
  onMoveToNext?: (lead: Lead) => void;
}

export function EnquiryCard({ lead, onApprove, onMoveToNext }: EnquiryCardProps) {
  const isReadyToBook = lead.status === "Ready to Book";
  
  return (
    <div className="glass-card-hover rounded-xl p-4 animate-scale-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{lead.name}</h4>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      {lead.ai_summary && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-3">
          <p className="text-sm text-foreground font-medium">AI Summary</p>
          <p className="text-sm text-muted-foreground mt-1">{lead.ai_summary}</p>
        </div>
      )}
      
      <div className="space-y-2 mb-4">
        {lead.property_details && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>{lead.property_details}</span>
          </div>
        )}
        {lead.preferred_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{lead.preferred_time}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {isReadyToBook && onApprove ? (
          <Button 
            onClick={() => onApprove(lead)}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            Approve & Book
          </Button>
        ) : onMoveToNext ? (
          <Button 
            onClick={() => onMoveToNext(lead)}
            variant="outline"
            className="flex-1 border-border hover:bg-muted"
            size="sm"
          >
            Move to Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

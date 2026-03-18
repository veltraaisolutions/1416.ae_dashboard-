import { EnquiryCard } from "./EnquiryCard";

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

interface EnquiryPipelineProps {
  leads: Lead[];
  onApprove: (lead: Lead) => void;
  onMoveToNext: (lead: Lead) => void;
}

const stages = [
  { id: "New", title: "New Inquiry", color: "bg-blue-500" },
  { id: "AI Qualification", title: "AI Qualification", color: "bg-yellow-500" },
  { id: "Ready to Book", title: "Ready to Book", color: "bg-green-500" },
  { id: "Booked", title: "Booked", color: "bg-primary" },
];

export function EnquiryPipeline({ leads, onApprove, onMoveToNext }: EnquiryPipelineProps) {
  const getLeadsByStatus = (status: string) => 
    leads.filter(lead => lead.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stages.map((stage) => {
        const stageLeads = getLeadsByStatus(stage.id);
        return (
          <div key={stage.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-2 w-2 rounded-full ${stage.color}`} />
              <h3 className="font-semibold text-foreground text-sm">{stage.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {stageLeads.length}
              </span>
            </div>
            <div className="flex-1 space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-xl border border-border/50">
              {stageLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No enquiries
                </p>
              ) : (
                stageLeads.map((lead) => (
                  <EnquiryCard
                    key={lead.id}
                    lead={lead}
                    onApprove={stage.id === "Ready to Book" ? onApprove : undefined}
                    onMoveToNext={stage.id !== "Booked" ? onMoveToNext : undefined}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

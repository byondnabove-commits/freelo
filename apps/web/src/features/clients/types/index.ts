export type Client = {
  id: string;
  organizationId: string;
  leadId: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  portalToken: string;
  notes: string | null;
  createdAt: string;
};
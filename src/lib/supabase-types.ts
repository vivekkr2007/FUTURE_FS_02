export type LeadSource = 'website' | 'instagram' | 'referral' | 'linkedin' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'converted';

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  text: string;
  created_at: string;
  created_by: string | null;
}

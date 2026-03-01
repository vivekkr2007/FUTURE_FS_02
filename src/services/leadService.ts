import { supabase } from '@/integrations/supabase/client';
import type { Lead, LeadNote, LeadSource, LeadStatus } from '@/lib/supabase-types';

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function fetchLead(id: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function createLead(lead: {
  full_name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  follow_up_date?: string;
}): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, updates: {
  status?: LeadStatus;
  follow_up_date?: string | null;
  full_name?: string;
  email?: string;
  phone?: string | null;
  source?: LeadSource;
}): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchLeadNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadNote[];
}

export async function addLeadNote(leadId: string, text: string): Promise<LeadNote> {
  const { data, error } = await supabase
    .from('lead_notes')
    .insert({ lead_id: leadId, text })
    .select()
    .single();
  if (error) throw error;
  return data as LeadNote;
}

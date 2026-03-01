import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLead, fetchLeadNotes, addLeadNote, updateLead, deleteLead } from '@/services/leadService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Globe, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { LeadStatus } from '@/lib/supabase-types';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['lead-notes', id],
    queryFn: () => fetchLeadNotes(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => updateLead(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status updated');
    },
  });

  const followUpMutation = useMutation({
    mutationFn: (date: string) => updateLead(id!, { follow_up_date: date || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Follow-up date updated');
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => addLeadNote(id!, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', id] });
      setNoteText('');
      toast.success('Note added');
    },
  });

  const delMutation = useMutation({
    mutationFn: () => deleteLead(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
      navigate('/leads');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lead) {
    return <p className="text-center text-muted-foreground py-12">Lead not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/leads')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Button>
        <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setShowDelete(true)}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{lead.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Added {format(new Date(lead.created_at), 'MMM d, yyyy')}</p>
          </div>
          <StatusBadge status={lead.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{lead.source}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{lead.follow_up_date ? format(new Date(lead.follow_up_date), 'MMM d, yyyy') : 'No follow-up set'}</span>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Update Status</Label>
              <Select value={lead.status} onValueChange={(v) => statusMutation.mutate(v as LeadStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={lead.follow_up_date || ''}
                onChange={e => followUpMutation.mutate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Notes ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={() => noteText.trim() && noteMutation.mutate()}
              disabled={!noteText.trim() || noteMutation.isPending}
              className="self-end"
            >
              Add
            </Button>
          </div>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">{note.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={() => delMutation.mutate()}
      />
    </div>
  );
}

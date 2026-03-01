import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '@/services/leadService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Phone, CheckCircle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const convertedCount = leads.filter(l => l.status === 'converted').length;
  const conversionRate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;

  const stats = [
    { title: 'Total Leads', value: total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'New', value: newCount, icon: UserPlus, color: 'text-[hsl(var(--status-new))]', bg: 'bg-[hsl(var(--status-new)/0.1)]' },
    { title: 'Contacted', value: contactedCount, icon: Phone, color: 'text-[hsl(var(--status-contacted))]', bg: 'bg-[hsl(var(--status-contacted)/0.1)]' },
    { title: 'Converted', value: convertedCount, icon: CheckCircle, color: 'text-[hsl(var(--status-converted))]', bg: 'bg-[hsl(var(--status-converted)/0.1)]' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your lead pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No leads yet. Add your first lead to get started.</p>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{lead.full_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-badge-${lead.status}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

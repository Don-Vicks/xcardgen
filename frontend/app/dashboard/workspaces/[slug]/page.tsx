'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { eventsRequest } from '@/lib/api/requests/events.request';
import { workspacesRequest } from '@/lib/api/requests/workspaces.request';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Eye,
  MoreHorizontal,
  Plus,
  Settings,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Workspace {
  id: string;
  name: string;
  description: string;
  slug: string;
  logo?: string;
}

interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  stats?: {
    totalVisits: number;
    totalGenerations: number;
    totalDownloads: number;
    totalShares: number;
  };
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.slug as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceSlug]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);

      // Load workspace details
      const workspacesResponse = await workspacesRequest.getAll();
      const ws = (workspacesResponse.data as Workspace[])?.find(
        (w) => w.slug === workspaceSlug
      );

      if (!ws) {
        toast.error('Workspace not found');
        router.push('/dashboard/workspaces');
        return;
      }

      setWorkspace(ws);

      // Load events for this workspace
      const eventsResponse = await eventsRequest.getAll({ workspaceId: ws.id });
      if (eventsResponse.data) {
        // @ts-ignore
        const eventsList = Array.isArray(eventsResponse.data) ? eventsResponse.data : (eventsResponse.data?.data || []);
        setEvents(eventsList as Event[]);
      }
    } catch (err) {
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => router.push('/dashboard/workspaces')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {workspace.name}
          </h1>
          <p className="text-muted-foreground">/{workspace.slug}</p>
        </div>
        <Link href={`/dashboard/workspaces/${workspaceSlug}/settings`}>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
        <Link href={`/dashboard/workspaces/${workspaceSlug}/members`}>
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {events.filter((e) => e.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e.stats?.totalGenerations || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Cards Generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e.stats?.totalShares || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Social Shares</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Events</h2>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        {events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first event to start generating attendee cards
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {event.name}
                          <Badge variant={event.isActive ? 'default' : 'secondary'}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString()
                            : 'No date set'}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/events/${event.slug}/design`}>
                            Edit Template
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/events/${event.slug}/analytics`}>
                            View Analytics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/e/${event.slug}`} target="_blank">
                            Public Page
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{event.stats?.totalVisits || 0} visits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span>{event.stats?.totalGenerations || 0} cards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span>{event.stats?.totalShares || 0} shares</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/events/${event.slug}/analytics`}>
                          <Button variant="outline" size="sm">
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/dashboard/events/${event.slug}/design`}>
                          <Button size="sm">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

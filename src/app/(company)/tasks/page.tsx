'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Search, Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { TaskResponse, PaginatedResponse } from '@/types/api';
import Link from 'next/link';

export default function TasksPage() {
  const [data, setData] = useState<PaginatedResponse<TaskResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTasks();
  }, [page, search]);

  const loadTasks = async () => {
    try {
      const result = await apiClient.getTasks({
        page,
        page_size: 20,
        search: search || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      if (!isCompleted) {
        await apiClient.completeTask(taskId);
      }
      loadTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate?: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-500">Manage your to-do list</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {data?.items.map((task) => (
          <Card key={task.id} className={task.is_completed ? 'opacity-60' : ''}>
            <CardContent className="flex items-start space-x-4 p-4">
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={() => toggleTaskComplete(task.id, task.is_completed)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${task.is_completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.priority && (
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    )}
                    {task.due_date && isOverdue(task.due_date) && !task.is_completed && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {task.due_date && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span className={isOverdue(task.due_date) && !task.is_completed ? 'text-red-600' : ''}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {task.assigned_to_name && (
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      <span>{task.assigned_to_name}</span>
                    </div>
                  )}
                  {task.related_contact_name && (
                    <Badge variant="outline" className="text-xs">
                      Contact: {task.related_contact_name}
                    </Badge>
                  )}
                  {task.related_lead_title && (
                    <Badge variant="outline" className="text-xs">
                      Lead: {task.related_lead_title}
                    </Badge>
                  )}
                  {task.related_deal_title && (
                    <Badge variant="outline" className="text-xs">
                      Deal: {task.related_deal_title}
                    </Badge>
                  )}
                </div>
              </div>
              <Link href={`/tasks/${task.id}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.total_pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages}
          >
            Next
          </Button>
        </div>
      )}

      {data?.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium">No tasks found</p>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by adding a task'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

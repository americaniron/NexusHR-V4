import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getStaleTime } from "@/lib/queryClient";
import {
  useListTasks,
  useGetTask,
  useCreateTask,
  useUpdateTask,
  getListTasksQueryKey,
  getGetTaskQueryKey,
} from "@workspace/api-client-react";

export function useTaskState(filters?: { status?: string; priority?: string; assigneeId?: number }) {
  const queryClient = useQueryClient();
  const queryKey = getListTasksQueryKey(filters);

  const tasksQuery = useListTasks(filters, {
    query: {
      queryKey,
      staleTime: getStaleTime("/api/tasks"),
    },
  });

  const invalidateTasks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
  }, [queryClient]);

  const createMutation = useCreateTask({
    mutation: {
      onSuccess: () => invalidateTasks(),
    },
  });

  const updateMutation = useUpdateTask({
    mutation: {
      onSuccess: () => invalidateTasks(),
    },
  });

  return {
    tasks: tasksQuery.data,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    invalidate: invalidateTasks,
  };
}

export function useTaskDetail(taskId: number | undefined) {
  const queryClient = useQueryClient();
  const queryKey = taskId ? getGetTaskQueryKey(taskId) : ["/api/tasks", "detail"];

  const taskQuery = useGetTask(taskId!, {
    query: {
      queryKey,
      enabled: !!taskId,
      staleTime: getStaleTime("/api/tasks"),
    },
  });

  const invalidate = useCallback(() => {
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  }, [queryClient, taskId]);

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
    refetch: taskQuery.refetch,
    invalidate,
  };
}

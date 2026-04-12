import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getStaleTime } from "@/lib/queryClient";
import {
  useListEmployees,
  useGetEmployee,
  useHireEmployee,
  useUpdateEmployee,
} from "@workspace/api-client-react";

export function useEmployeeState() {
  const queryClient = useQueryClient();

  const employeesQuery = useListEmployees(undefined, {
    query: {
      staleTime: getStaleTime("/api/employees"),
    },
  });

  const invalidateEmployees = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
  }, [queryClient]);

  const createMutation = useHireEmployee({
    mutation: {
      onSuccess: () => invalidateEmployees(),
    },
  });

  const updateMutation = useUpdateEmployee({
    mutation: {
      onSuccess: () => invalidateEmployees(),
    },
  });

  return {
    employees: employeesQuery.data,
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error,
    refetch: employeesQuery.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    invalidate: invalidateEmployees,
  };
}

export function useEmployeeDetail(employeeId: number | undefined) {
  const queryClient = useQueryClient();

  const employeeQuery = useGetEmployee(employeeId!, {
    query: {
      enabled: !!employeeId,
      staleTime: getStaleTime("/api/employees"),
    },
  });

  const invalidate = useCallback(() => {
    if (employeeId) {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    }
  }, [queryClient, employeeId]);

  return {
    employee: employeeQuery.data,
    isLoading: employeeQuery.isLoading,
    error: employeeQuery.error,
    refetch: employeeQuery.refetch,
    invalidate,
  };
}

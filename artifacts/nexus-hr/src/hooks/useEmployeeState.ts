import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getStaleTime } from "@/lib/queryClient";
import {
  useListEmployees,
  useGetEmployee,
  useHireEmployee,
  useUpdateEmployee,
  getListEmployeesQueryKey,
  getGetEmployeeQueryKey,
} from "@workspace/api-client-react";

export function useEmployeeState() {
  const queryClient = useQueryClient();
  const queryKey = getListEmployeesQueryKey();

  const employeesQuery = useListEmployees(undefined, {
    query: {
      queryKey,
      staleTime: getStaleTime("/api/employees"),
    },
  });

  const invalidateEmployees = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
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
  const queryKey = employeeId ? getGetEmployeeQueryKey(employeeId) : ["/api/employees", "detail"];

  const employeeQuery = useGetEmployee(employeeId!, {
    query: {
      queryKey,
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

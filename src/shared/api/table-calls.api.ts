import { http } from '@/lib/http';

export interface TableServiceCall {
  id: number;
  tenant_id: string;
  branch_id?: number | null;
  table_number: string;
  call_type: 'waiter' | 'bill' | 'water' | 'clean' | 'bill_paid' | 'rescue';
  status: 'pending' | 'resolved';
  bill_amount?: number | null;
  tip_amount?: number | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

export const tableCallsApi = {
  createCall: async (data: { tableNumber: string; callType?: 'waiter' | 'bill' | 'water' | 'clean'; branchId?: number; notes?: string }, _tenantId?: string) => {
    try {
      return await http<TableServiceCall>(`/api/sales/table-calls`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: 1,
        tenant_id: 'demo',
        table_number: data.tableNumber,
        call_type: data.callType || 'waiter',
        status: 'pending',
        created_at: new Date().toISOString(),
      } as TableServiceCall;
    }
  },

  listPendingCalls: async (_branchId?: number) => {
    try {
      return await http<TableServiceCall[]>(`/api/sales/table-calls`);
    } catch {
      return [];
    }
  },

  resolveCall: async (id: number) => {
    return http<TableServiceCall>(`/api/sales/table-calls/${id}/resolve`, { method: 'PATCH' });
  },

  resolveCallsForTable: async (tableNumber: string) => {
    return http<void>(`/api/sales/table-calls/table/${tableNumber}/resolve`, { method: 'PATCH' });
  },
};

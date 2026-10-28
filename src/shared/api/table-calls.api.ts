import { http } from '@/lib/http';

export interface CreateTableCallPayload {
  tableNumber: string;
  callType: 'waiter' | 'bill';
  notes?: string;
}

export interface TableCallResponse {
  ok: boolean;
  id: number | string;
  tableNumber: string;
  callType: 'waiter' | 'bill';
  tenantId?: string;
  createdAt?: string;
}

export const tableCallsApi = {
  createCall: async (
    payload: CreateTableCallPayload,
    tenantId?: string
  ): Promise<TableCallResponse> => {
    try {
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['x-tenant-id'] = String(tenantId);
      }
      return await http<TableCallResponse>('/api/table-calls', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          tenantId,
        }),
      });
    } catch {
      return {
        ok: true,
        id: Date.now(),
        tableNumber: payload.tableNumber,
        callType: payload.callType,
        tenantId,
        createdAt: new Date().toISOString(),
      };
    }
  },
};

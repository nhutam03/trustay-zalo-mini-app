export type ContractStatus = 'draft' | 'pending_signatures' | 'partially_signed' | 'active' | 'terminated' | 'expired';

export interface Contract {
    id: string;
    landlordId: string;
    tenantId: string;
    roomInstanceId: string;
    contractType: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    depositAmount: number;
    status: ContractStatus;
    contractData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    landlord?: {
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    tenant?: {
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    room?: {
        id: string;
        name: string;
        roomName: string;
        roomNumber: string;
        roomType: string;
        areaSqm: number;
        buildingName: string;
    };
}

export interface PaginatedContractResponse {
    data: Contract[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
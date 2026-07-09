export interface User {

  id: string;

  email: string;

  role: 'ADMIN' | 'NEGOCIO';

  tenantId: string | null;

  status: string;

  profile: {

    firstName: string;

    lastName: string;

    phone?: string;

  };

}



export interface AuthResponse {

  accessToken: string;

  refreshToken: string;

  expiresIn: number;

  user: User;

}



export interface Business {

  id: string;

  name: string;

  slug: string;

  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  contactEmail: string;

  contactPhone?: string;

  createdAt: string;

  updatedAt: string;

}



export interface CreateBusinessResult {
  business: Business;
  owner: User;
  builderBot?: { deviceId: string; sessionStatus: string } | null;
  builderBotWarning?: string;
  platformApiKey?: string;
}

export interface DeleteBusinessResult {
  tenantId: string;
  businessName: string;
  documents: number;
  orders: number;
  users: number;
  storageFiles: number;
  vectorsCleared: boolean;
  builderBotDeployDeleted: boolean;
  builderBotProjectDeleted: boolean;
  dynamoRecords: number;
  auditLogs: number;
  warnings: string[];
}



export interface PaginatedResponse<T> {

  data: T[];

  cursor?: string;

  hasMore: boolean;

}



export interface ApiResponse<T> {

  data: T;

}



export interface ApiError {

  error: {

    code: string;

    message: string;

    details?: Record<string, string[]>;

  };

}


import {
  type ApiRoute,
  type Compliance,
  type BankEntry,
  type PoolMember,
} from "../../types";

const API_BASE_URL = "http://localhost:3030";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
}

// Routes API
export const routesApi = {
  getAllRoutes: async (): Promise<ApiRoute[]> => {
    const response = await fetch(`${API_BASE_URL}/routes`);
    return handleResponse<ApiRoute[]>(response);
  },

  setRouteAsBaseline: async (id: string): Promise<ApiRoute> => {
    const response = await fetch(`${API_BASE_URL}/routes/${id}/baseline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Send an empty JSON object as body
    });
    return handleResponse<ApiRoute>(response);
  },

  getComparison: async (): Promise<ApiRoute[]> => {
    const response = await fetch(`${API_BASE_URL}/routes/comparison`);
    return handleResponse<ApiRoute[]>(response);
  },
};

// Compliance API
export const complianceApi = {
  getComplianceBalance: async (
    shipId: string,
    year: number,
  ): Promise<Compliance> => {
    const response = await fetch(
      `${API_BASE_URL}/compliance/cb?shipId=${shipId}&year=${year}`,
    );
    return handleResponse<Compliance>(response);
  },

  getAllComplianceBalances: async (year: number): Promise<Compliance[]> => {
    const response = await fetch(`${API_BASE_URL}/compliance/cb?year=${year}`);
    return handleResponse<Compliance[]>(response);
  },

  getAdjustedComplianceBalance: async (
    shipId: string,
    year: number,
  ): Promise<{ shipId: string; year: number; adjustedCb: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/compliance/adjusted-cb?shipId=${shipId}&year=${year}`,
    );
    return handleResponse<{ shipId: string; year: number; adjustedCb: number }>(
      response,
    );
  },

  getAllAdjustedComplianceBalances: async (
    year: number,
  ): Promise<{ shipId: string; year: number; adjustedCb: number }[]> => {
    const response = await fetch(
      `${API_BASE_URL}/compliance/adjusted-cb?year=${year}`,
    );
    return handleResponse<
      { shipId: string; year: number; adjustedCb: number }[]
    >(response);
  },
};

// Banking API
export const bankingApi = {
  getBankRecords: async (shipId: string, year: number): Promise<BankEntry[]> => {
    const response = await fetch(
      `${API_BASE_URL}/banking/records?shipId=${shipId}&year=${year}`,
    );
    return handleResponse<BankEntry[]>(response);
  },

  bankComplianceBalance: async (
    shipId: string,
    year: number,
  ): Promise<BankEntry> => {
    const response = await fetch(`${API_BASE_URL}/banking/bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shipId, year }),
    });
    return handleResponse<BankEntry>(response);
  },

  applyBankedSurplus: async (
    shipId: string,
    year: number,
    amount: number,
  ): Promise<BankEntry> => {
    const response = await fetch(`${API_BASE_URL}/banking/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shipId, year, amount }),
    });
    return handleResponse<BankEntry>(response);
  },
};

// Pooling API
export const poolingApi = {
  createPool: async (year: number, shipIds: string[]): Promise<PoolMember[]> => {
    const response = await fetch(`${API_BASE_URL}/pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, shipIds }),
    });
    return handleResponse<PoolMember[]>(response);
  },
};

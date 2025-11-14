import { routesApi, complianceApi, bankingApi, poolingApi } from './adapters/infrastructure/api-client';

export const api = {
  routes: routesApi,
  compliance: complianceApi,
  banking: bankingApi,
  pooling: poolingApi,
};

export function tenantScope(tenantId: string) {
  return { tenantId, deletedAt: null };
}

export type VoicesSearchParams = Record<string, string | string[] | undefined>;

export function getParamArray(
  searchParams: VoicesSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function getSingleParam(
  searchParams: VoicesSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

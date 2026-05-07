/**
 * Agency status filter options
 */
export enum AgencyStatusFilter {
  All = 'all',
  Active = 'active',
  Inactive = 'inactive',
}

/**
 * Agency table filter keys
 */
export enum AgencyFilterKey {
  Search = 'search',
  IsActive = 'isActive',
}

/**
 * Agency table column keys
 */
export enum AgencyColumnKey {
  Name = 'name',
  Tel = 'tel',
  Address = 'address',
  Note = 'note',
  IsActive = 'isActive',
}

/**
 * Agency action IDs
 */
export enum AgencyActionId {
  View = 'view',
  Edit = 'edit',
  Delete = 'delete',
}

/**
 * Filter debounce time (ms)
 */
export const SEARCH_DEBOUNCE_TIME = 300;

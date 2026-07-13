export const CATEGORIES = ['CONCERT', 'SPORTS', 'COMEDY', 'FESTIVAL', 'OTHER'] as const
export type Category = typeof CATEGORIES[number]

export const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const
export type City = typeof CITIES[number]

export const PLATFORM_FEE_PCT = 0.10  // 10% platform fee on buyer price

export const EVENT_STATUSES = ['UPCOMING', 'LIVE', 'PAST', 'CANCELLED'] as const
export const LISTING_STATUSES = ['PENDING_VERIFICATION', 'ACTIVE', 'SOLD', 'EXPIRED', 'REJECTED'] as const

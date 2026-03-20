export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum DealStatus {
  PENDING = 'PENDING',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL', // Plataforma subió evidencias; espera OK del comprador
  FUNDED = 'FUNDED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_BUYER = 'RESOLVED_BUYER',
  RESOLVED_SELLER = 'RESOLVED_SELLER',
}

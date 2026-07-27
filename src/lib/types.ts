export type Role = "NO_ACCESS" | "USER" | "ADMIN";

export type SubscriptionStatus = "WAITING" | "APPROVED" | "DECLINED";

export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export type SubscriptionPaymentOrigin =
  | "MERCADO_PAGO"
  | "MANUAL"
  | "COMPLIMENTARY"
  | "NONE";

export type CouponType = "PERCENTAGE" | "FIXED";

export type ResultType = "SCORE" | "RANKING";

export type FeeBreakdown = {
  onlineGross: number;
  manualGross: number;
  billableGross: number;
  wodfulFeePercent: number;
  mpFeePercent: number;
  wodfulFeeAmount: number;
  mpFeeAmount: number;
  organizerNetEstimate: number;
  wodfulNetMarginEstimate: number;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  totpEnabled?: boolean;
  defaultWodfulFeePercent: number | null;
};

export type AdminUserListItem = PublicUser & {
  championshipsCount: number;
  lastChampionshipAt: string | null;
  lastChampionshipName: string | null;
  revenuePaid: number;
  defaultWodfulFeePercent: number | null;
};

export type AdminLoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: Role;
    totpEnabled: boolean;
  };
  requires2fa: boolean;
};

export type ListUsersResponse = {
  data: AdminUserListItem[];
  total: number;
  page: number;
  perPage: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

export type ApiErrorBody = {
  message?: string;
};

export type DashboardKpis = {
  organizersActive: number;
  organizersTotal: number;
  eventsTotal: number;
  eventsActive: number;
  subscriptionsWaiting: number;
  paymentsPending: number;
};

export type DashboardSeriesPoint = {
  date: string;
  count: number;
};

export type DashboardAlert = {
  type: string;
  message: string;
  count: number;
};

export type AdminDashboard = {
  kpis: DashboardKpis;
  series: {
    newEvents7d: DashboardSeriesPoint[];
    newSubscriptions7d: DashboardSeriesPoint[];
  };
  alerts: DashboardAlert[];
};

export type OrganizerSummary = {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive?: boolean;
  role?: Role;
};

export type ChampionshipListItem = {
  id: string;
  name: string;
  accessCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  organizer: OrganizerSummary | null;
  wodfulFeePercent: number;
  mpFeePercentEstimate: number | null;
  counts: {
    approved: number;
    waiting: number;
    declined: number;
    total: number;
    revenuePaid: number;
    revenueManual: number;
    billableGross: number;
    wodfulFeeAmount: number;
    mpFeeAmount: number;
    organizerNetEstimate: number;
    wodfulNetMarginEstimate: number;
  };
};

export type ChampionshipAnalytics = {
  summary: {
    athletes: number;
    subscriptionsApproved: number;
    subscriptionsWaiting: number;
    subscriptionsDeclined: number;
    subscriptionsOnline: number;
    subscriptionsOutside: number;
    subscriptionsComplimentary: number;
    ticketsSold: number;
    ticketsCapacity: number;
    revenueApproximate: number;
    revenuePaid: number;
    revenueEstimated: number;
    couponsRedeemed: number;
    discountTotal: number;
    kitsTaken: number;
    medalsTaken: number;
  };
  byCategory: {
    categoryId: string;
    name: string;
    athletes: number;
    subscriptions: number;
  }[];
  byBox: { affiliation: string; athletes: number }[];
  byCity: { city: string; athletes: number }[];
  byShirtSize: { size: string; athletes: number }[];
  byCoupon: {
    couponId: string;
    code: string;
    redemptions: number;
    discountTotal: number;
  }[];
  registrationsOverTime: {
    date: string;
    count: number;
    approvedCount: number;
  }[];
  ticketFill: {
    ticketId: string;
    name: string;
    categoryName: string;
    quantity: number;
    sold: number;
  }[];
};

export type ChampionshipDetail = {
  id: string;
  name: string;
  accessCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  address: string;
  description: string | null;
  resultType: ResultType;
  banner: string;
  createdAt: string;
  organizer: OrganizerSummary | null;
  wodfulFeePercent: number;
  mpFeePercentEstimate: number | null;
  defaultWodfulFeePercent: number;
  defaultMpFeePercent: number;
  finance: FeeBreakdown;
  categories: {
    id: string;
    name: string;
    isTeam: boolean;
    members: number;
    tickets: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      enabled: boolean;
      startDate: string;
      endDate: string;
      subscriptionsCount: number;
    }[];
  }[];
  coupons: {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    isActive: boolean;
    maxRedemptions: number | null;
    startsAt: string | null;
    expiresAt: string | null;
    redemptions: number;
  }[];
  analytics: ChampionshipAnalytics;
};

export type UserOverview = {
  user: PublicUser & {
    totpEnabled: boolean;
    platformDefaultWodfulFeePercent: number;
  };
  championships: {
    id: string;
    name: string;
    accessCode: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    wodfulFeePercent: number;
    mpFeePercentEstimate: number | null;
    revenuePaid: number;
    wodfulFeeAmount: number;
  }[];
  metrics: {
    championshipsCount: number;
    subscriptionsApproved: number;
    subscriptionsWaiting: number;
    revenuePaid: number;
  };
  recentPayments: {
    id: string;
    status: PaymentStatus;
    amountFinal: number;
    createdAt: string;
    championship: { id: string; name: string } | null;
  }[];
};

export type ImpersonateResponse = {
  token: string;
  user: { name: string; email: string; role: Role };
  expiresIn: string;
  webUrl: string;
};

export type SettlementLine = {
  label: string;
  ticketName: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
};

export type SettlementPreview = {
  event: {
    id: string;
    name: string;
    wodfulFeePercent: number;
  };
  lines: SettlementLine[];
  complimentary: { name: string }[];
  totals: {
    payingSubscriptions: number;
    payingAthletes: number;
    complimentaryCount: number;
    gross: number;
    wodfulFeePercent: number;
    wodfulFeeAmount: number;
    organizerNet: number;
  };
  copyText: string;
};

export type SubscriptionListItem = {
  id: string;
  nickname: string;
  status: SubscriptionStatus;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  createdAt: string;
  paidOnline: boolean;
  isComplimentary: boolean;
  paymentOrigin: SubscriptionPaymentOrigin;
  ticketPrice: number;
  amountPaid: number | null;
  amountEstimated: number;
  category: { name: string };
  championship: {
    id: string;
    name: string;
    accessCode: string;
    organizer: { id: string; name: string; email: string } | null;
  } | null;
};

export type SubscriptionDetail = SubscriptionListItem & {
  updatedAt: string;
  ticket: {
    id: string;
    name: string;
    price: number;
    categoryName: string | null;
  } | null;
  participants: {
    id: string;
    subscriptionId: string | null;
    categoryId: string | null;
    name: string;
    medalTakenBy: string | null;
    kitTakenBy: string | null;
    identificationCode: string;
    affiliation: string;
    city: string;
    tShirtSize: string;
    tShirtName: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  payments: {
    id: string;
    status: PaymentStatus;
    provider: string;
    amountOriginal: number;
    amountFinal: number;
    providerPreferenceId: string | null;
    providerPaymentId: string | null;
    approvedEmailSentAt: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  coupons: {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    valueDiscounted: number;
  }[];
};

export type PaymentListItem = {
  id: string;
  status: PaymentStatus;
  provider: string;
  amountOriginal: number;
  amountFinal: number;
  providerPreferenceId: string | null;
  providerPaymentId: string | null;
  approvedEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    nickname: string;
    status: SubscriptionStatus;
    responsibleEmail: string;
    isComplimentary: boolean;
  } | null;
  championship: {
    id: string;
    name: string;
    organizer: { id: string; name: string; email: string } | null;
  } | null;
  ticketName: string;
};

export type PaymentDetail = {
  id: string;
  status: PaymentStatus;
  provider: string;
  amountOriginal: number;
  amountFinal: number;
  providerPreferenceId: string | null;
  providerPaymentId: string | null;
  approvedEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: {
    id: string;
    nickname: string;
    status: SubscriptionStatus;
    responsibleName: string;
    responsibleEmail: string;
    isComplimentary: boolean;
  };
  ticket: { id: string; name: string; price: number };
  championship: {
    id: string;
    name: string;
    accessCode: string;
    organizer: { id: string; name: string; email: string } | null;
  } | null;
  coupon: {
    id: string;
    code: string;
    type: CouponType;
    value: number;
  } | null;
};

export type AdminHealth = {
  api: "up";
  database: "up" | "down";
  redis: "up" | "down" | "unknown";
  uptime: number;
  lastMpWebhookAt: string | null;
  checkedAt: string;
};

export type AuditLogItem = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { id: string; name: string; email: string };
};

export type TotpSetupResponse = {
  secret: string;
  otpauthUrl: string;
};

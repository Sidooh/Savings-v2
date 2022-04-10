export enum Status {
    PENDING = 'pending',
    INACTIVE = 'inactive',
    FAILED = 'failed',

    ACTIVE = 'active',
    VERIFIED = 'verified',

    COMPLETED = 'completed',
}

export enum Frequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum SavingsAccountType {
    PERSONAL = 'personal',
    GROUP = 'group',
}

export enum GroupType {
    DEFAULT = 'default',
    CLUB_SIDOOH = 'club_sidooh',
    ENTERPRISE = 'enterprise',
    AGENT = 'agent',
}

export enum PersonalAccountType {
    GOAL = 'goat',
    EMERGENCY = 'emergency',
    RETIREMENT = 'retirement',
    MONTHLY_INCOME = 'monthly_income',

    INTEREST = 'interest',
}

export enum TransactionType {
    CREDIT = 'credit',
    DEBIT = 'debit',
}
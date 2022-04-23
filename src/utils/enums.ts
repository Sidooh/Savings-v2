export enum Status {
    PENDING = 'PENDING',
    INACTIVE = 'INACTIVE',
    FAILED = 'FAILED',

    ACTIVE = 'ACTIVE',
    VERIFIED = 'VERIFIED',

    COMPLETED = 'COMPLETED',
}

export enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum Duration {
    YEAR = 12,
}

export enum SavingsAccountType {
    PERSONAL = 'PERSONAL',
    GROUP = 'GROUP',
}

export enum GroupType {
    DEFAULT = 'DEFAULT',
    CLUB_SIDOOH = 'CLUB_SIDOOH',
    ENTERPRISE = 'ENTERPRISE',
    AGENT = 'AGENT',
}

export enum PersonalAccountType {
    GOAL = 'GOAL',
    EMERGENCY = 'EMERGENCY',
    RETIREMENT = 'RETIREMENT',
    MONTHLY_INCOME = 'MONTHLY_INCOME',

    INTEREST = 'INTEREST',
}

export enum TransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

export enum Description {
    ACCOUNT_DEPOSIT = 'Account Deposit',
    DEBIT = 'DEBIT',
}
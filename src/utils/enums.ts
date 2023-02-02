export enum Status {
    PENDING = 'PENDING',
    INACTIVE = 'INACTIVE',
    FAILED = 'FAILED',

    REQUESTED = 'REQUESTED',

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

export enum DefaultAccount {
    CURRENT = 'CURRENT',
    LOCKED = 'LOCKED',
}

export enum PersonalAccountType {
    GOAL = 'GOAL',
    EMERGENCY = 'EMERGENCY',
    RETIREMENT = 'RETIREMENT',
    MONTHLY_INCOME = 'MONTHLY_INCOME',
}

export enum TransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

export enum Description {
    ACCOUNT_DEPOSIT = 'Account Deposit',
    ACCOUNT_WITHDRAWAL = 'Account Withdrawal',
    ACCOUNT_WITHDRAWAL_REFUND = 'Account Withdrawal Refund',
    MONTHLY_INTEREST_ALLOCATION = 'Interest Allocation',
}

export enum EventType {
    WITHDRAWAL_PAYMENT = 'WITHDRAWAL_PAYMENT',
    WITHDRAWAL_FAILURE = 'WITHDRAWAL_FAILURE',
    PAYMENT_FAILURE = 'PAYMENT_FAILURE',
    ERROR_ALERT = 'ERROR_ALERT',
    STATUS_UPDATE = 'STATUS_UPDATE',
    SP_REQUEST_FAILURE = 'SP_REQUEST_FAILURE',
    TEST = 'TEST',
    DEFAULT = 'DEFAULT',
}

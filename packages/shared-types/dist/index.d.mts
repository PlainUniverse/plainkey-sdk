type UserIdentifier = {
    userId?: string;
    userName?: string;
};
type PublicUser = {
    id: string;
    userName?: string;
    metadata?: Record<string, unknown>;
};

export type { PublicUser, UserIdentifier };

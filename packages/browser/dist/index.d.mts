import { UserIdentifier, PublicUser } from '@plainkey/shared-types';

type RegistrationBeginRequest = {
    userName?: string;
    userMetadata?: Record<string, unknown>;
};
type UserCredentialBeginRequest = {
    userIdentifier: UserIdentifier;
};
type LoginBeginRequest = {
    userIdentifier?: UserIdentifier;
};

type IssuedSession = {
    sessionId: string;
    token: string;
    expiresInSeconds: number;
    tokenType: string;
    refreshToken: string;
};
type RegistrationCompleteResponse = {
    success: boolean;
    user: PublicUser;
    token: IssuedSession;
    credential: {
        id: string;
        webAuthnId: string;
    };
};
type UserCredentialCompleteResponse = {
    success: boolean;
    user: PublicUser;
    token: IssuedSession;
    credential: {
        id: string;
        webAuthnId: string;
    };
};
type LoginCompleteResponse = {
    verified: boolean;
    user: PublicUser;
    token: IssuedSession;
};

type PlainKeyClientParams = {
    clientId: string;
    baseUrl?: string;
};
declare class PlainKeyClient {
    private readonly clientId;
    private readonly baseUrl;
    constructor(clientParams: PlainKeyClientParams);
    /**
     * Registration of a new user with passkey.
     * Creates a new user and adds a credential to it.
     */
    Registration(beginParams: RegistrationBeginRequest): Promise<RegistrationCompleteResponse>;
    /**
     * Add credential to existing user.
     * Requires valid user authentication token (log user in first which will set a user token cookie, then call this).
     */
    AddCredential(beginParams: UserCredentialBeginRequest): Promise<UserCredentialCompleteResponse>;
    /**
     * Performs a login ceremony.
     */
    Login(beginParams: LoginBeginRequest): Promise<LoginCompleteResponse>;
}

export { PlainKeyClient, type PlainKeyClientParams };

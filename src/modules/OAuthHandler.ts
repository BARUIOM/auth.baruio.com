import axios from "axios";

export type Credentials = {
    accessToken: string;
    refreshToken: string;
}

export type OAuthParameters = {
    client_id: string;
    response_type: 'code';
    redirect_uri: string;

    state?: string;
    scope?: string[];

    [key: string]: string | string[] | undefined;
};

type RequestOptions = {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
};

type OAuthGrantOptions<T extends string> = {
    grant_type: T;
};

export type OAuthCodeGrantOptions = OAuthGrantOptions<'authorization_code'> & {
    code: string;
    redirect_uri: string;
};

export type OAuthRefreshGrantOptions = OAuthGrantOptions<'refresh_token'> & {
    refresh_token: string;
};

export class TokenExchangeError extends Error { }

export class OAuthHandler {

    constructor(
        private readonly tokenUri: string,
        private readonly authUri?: string,
    ) { }

    public getAuthorizationURL(options?: OAuthParameters): string | null {
        if (this.authUri) {
            const url = new URL(this.authUri);
            const params = Object.assign({}, options);

            for (const key in params) {
                const value = params[key];

                if (Array.isArray(value)) {
                    url.searchParams.set(key, value.join(','));
                    continue;
                }

                url.searchParams.set(key, value as string);
            }

            return url.toString();
        }

        return null;
    }

    public async exchangeCodeForToken(options: OAuthCodeGrantOptions, requestOptions?: RequestOptions): Promise<Credentials> {
        const data = new URLSearchParams(options);
        const response = await axios.post(this.tokenUri, data, requestOptions)
            .catch(e => { throw new TokenExchangeError(e) });

        if (response.status === 200)
            return {
                accessToken: response.data['access_token'],
                refreshToken: response.data['refresh_token'],
            };

        throw new TokenExchangeError('Unable to request for an access token');
    }

    public async exchangeRefreshToken(options: OAuthRefreshGrantOptions, requestOptions?: RequestOptions): Promise<Credentials> {
        const data = new URLSearchParams(options);
        const response = await axios.post(this.tokenUri, data, requestOptions)
            .catch(e => { throw new TokenExchangeError(e) });

        if (response.status === 200)
            return {
                accessToken: response.data['access_token'],
                refreshToken: options.refresh_token,
            };

        throw new TokenExchangeError('Unable to request for a refreshed token');
    }

}

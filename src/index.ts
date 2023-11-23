import * as schema from "./schema.js";
import * as z from "zod";

export { schema };

/**
 * An error that is thrown when an error occurs while fetching lyrics.
 */
export abstract class UtauError extends Error { }

/**
 * An error that is thrown when the server response is invalid.
 */
export class ValidationError extends UtauError {
    constructor(readonly cause: z.ZodError<schema.LyricsResponse>) {
        super("Unable to validate server response", { cause })
    }
}

/**
 * An error that is thrown when the server returns a failed response.
 */
export class FailedRequestError extends UtauError {
    constructor(
        readonly response: schema.FailedLyricsResponse,
        readonly status: number
    ) {
        super(`[${status}] ${response.data.message}`);
        this.name = "LyricsError";
    }
}

export type ApiVersion = 1;

/** The default URL to use. */
export const DEFAULT_URL = "https://utau.keia.one";

/** The default API version, usually the recommended one. */
export const DEFAULT_VERSION: ApiVersion = 1;

/**
 * Fetch lyrics from the Utau API.
 * 
 * This function will throw an error if the request fails or if the response is invalid, any other errors are considered
 * a failed HTTP request.
 * 
 * @param query The query to search for, it can either be a query, e.g., `flashlights by the forest powfu`, or a
 *              reference to a spotify, apple, or deezer track, e.g., `spotify:4iV5W9uYEdYUVa79Axb7Rh`.
 *              
 * @param types The types of lyrics to search for.
 */
export async function fetchLyrics(
    query: string,
    {
        baseUrl = DEFAULT_URL,
        version = DEFAULT_VERSION,
        ...options
    }: FetchLyricsOptions
): Promise<schema.LyricsResponse> {
    const url = new URL(`/v${version}/lyrics`, baseUrl);
    url.searchParams.set("query", query);
    url.searchParams.set("types", [...new Set(options.types)].join(","));

    const headers = new Headers();
    headers.set("User-Agent", options.userAgent);
    headers.set("Authorization", `Bearer ${options.apiKey}`);

    /* make a request to utau */
    const response = await fetch(url, { headers, signal: options.signal });

    /* parse the JSON response */
    const result = schema.lyricsResponse.safeParse(await response.json());
    if (!result.success) {
        throw new ValidationError(result.error);
    }

    /* check if the request was successful. */
    if (!result.data.success) {
        throw new FailedRequestError(result.data, response.status);
    }

    /* return the data */
    return result.data;
}

/**
 * Extract a specific type of lyrics from a successful lyrics response.
 * 
 * @param response The successful lyrics response.
 * @param type     The type of lyrics to extract.
 * @returns The extracted lyrics or `null` if the response does not contain the specified type of lyrics.
 */
export const extract = <T extends schema.LyricsType>(
    response: schema.SuccessfulLyricsResponse,
    type: T
): Extract<schema.Lyrics, { type: T }> | null => {
    // @ts-expect-error
    return response.data.lyrics.find((l) => l.type === type) ?? null;
}

export interface FetchLyricsOptions {
    /**
     * The types of lyrics to search for.
     */
    types: [schema.LyricsType, ...schema.LyricsType[]];

    /**
     * The API key to use for authentication.
     */
    apiKey: string;

    /**
     * The user agent to use for the request.
     */
    userAgent: string;

    /**
     * The fetch implementation to use.
     */
    fetch?: typeof fetch;

    /**
     * The signal to use for the request.
     */
    signal?: AbortSignal;

    /** 
     * The API version to use.
     */
    version?: ApiVersion;

    /**
     * The base URL to use for the request.
     */
    baseUrl?: string;
}

import { z } from "zod";

export const lyric = z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
});

export const lyricsType = z.union([
    z.literal("wbw"),
    z.literal("lbl"),
    z.literal("raw"),
]);

export const lyrics = z.union([
    z.object({
        type: z.literal("wbw"),
        lyrics: lyric.merge(z.object({ syllables: z.array(lyric) })).array(),
        copyright: z.string(),
    }),
    z.object({
        type: z.literal("lbl"),
        lyrics: z.array(lyric),
        copyright: z.string(),
    }),
    z.object({
        type: z.literal("raw"),
        text: z.string(),
        copyright: z.string(),
    }),
]);

export const track = z.object({
    id: z.string(),
    title: z.string(),
    artists: z.array(z.string()),
    genres: z.array(z.string()),
    length: z.number(),
    explicit: z.boolean(),
    album_id: z.nullable(z.string()),
    album_name: z.string(),
});

export const failedLyricsResponse = z.object({
    success: z.literal(false),
    data: z.object({ message: z.string() }),
});

export const successfulLyricsResponse = z.object({
    success: z.literal(true),
    data: z.object({ lyrics: z.array(lyrics), track }),
});

export const lyricsResponse = z.union([
    failedLyricsResponse,
    successfulLyricsResponse,
]);

export type SuccessfulLyricsResponse = z.TypeOf<
    typeof successfulLyricsResponse
>;

export type FailedLyricsResponse = z.TypeOf<typeof failedLyricsResponse>;

export type LyricsResponse = z.TypeOf<typeof lyricsResponse>;

export type Lyrics = z.TypeOf<typeof lyrics>;

export type LyricsType = z.TypeOf<typeof lyricsType>;

export type Lyric = z.TypeOf<typeof lyric>;

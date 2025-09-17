import { API_URL } from './script.js';

// Helper function for making API calls with Authorization header
async function spotifyApiCall(url, token) {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Helper for MusicBrainz API calls
async function musicBrainzApiCall(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'MeowtifyRecommendationModule/1.0 (hhg04121@gmail.com)' // MusicBrainz requires a User-Agent
        }
    });
    if (!response.ok) {
        throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Resolves a Spotify track ID for a given song and artist.
 * Caches resolved IDs in localStorage.
 * Uses MusicBrainz as a fallback if Spotify search fails.
 * @param {string} song - The name of the song.
 * @param {string} artist - The name of the artist.
 * @param {string} token - Spotify access token.
 * @returns {Promise<string|null>} - The Spotify track ID or null if not found.
 */
export async function resolveTrackId(song, artist, token) {
    if (!token) {
        console.log('[resolveTrackId] Spotify token not available. Skipping track ID resolution.');
        return null;
    }

    const cacheKey = `${song.toLowerCase()}_${artist.toLowerCase()}`;
    let resolvedTrackIds = JSON.parse(localStorage.getItem('resolvedTrackIds') || '{}');

    // 1. Check cache
    if (resolvedTrackIds[cacheKey]) {
        console.log(`[resolveTrackId] Cache hit for ${song} by ${artist}: ${resolvedTrackIds[cacheKey]}`);
        return resolvedTrackIds[cacheKey];
    }

    let spotifyTrackId = null;

    try {
        // 2. Query Spotify Search API
        console.log(`[resolveTrackId] Searching Spotify for "${song} ${artist}"`);
        const spotifySearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(song + ' ' + artist)}&type=track&limit=1`;
        const spotifyData = await spotifyApiCall(spotifySearchUrl, token);

        if (spotifyData.tracks && spotifyData.tracks.items.length > 0) {
            spotifyTrackId = spotifyData.tracks.items[0].id;
            console.log(`[resolveTrackId] Found Spotify ID via Spotify search: ${spotifyTrackId}`);
        } else {
            console.log(`[resolveTrackId] Spotify search found no results for "${song} ${artist}".`);
        }
    } catch (error) {
        console.error(`[resolveTrackId] Spotify search failed for "${song} ${artist}":`, error);
    }

    // 3. Fallback to MusicBrainz if Spotify failed
    if (!spotifyTrackId) {
        console.log(`[resolveTrackId] Falling back to MusicBrainz for "${song} by ${artist}"`);
        try {
            const mbSearchUrl = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(song)}%20AND%20artist:${encodeURIComponent(artist)}&fmt=json&limit=1`;
            const mbData = await musicBrainzApiCall(mbSearchUrl);

            if (mbData.recordings && mbData.recordings.length > 0) {
                const recording = mbData.recordings[0];
                console.log(`[resolveTrackId] Found MusicBrainz recording: ${recording.title} by ${recording['artist-credit'][0].name}`);

                // Try to find a Spotify ID in MusicBrainz relations
                if (recording.relations) {
                    for (const relation of recording.relations) {
                        if (relation.type === 'stream for free' && relation.url && relation.url.resource.includes('spotify.com/track/')) {
                            const spotifyUrl = relation.url.resource;
                            const match = spotifyUrl.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
                            if (match && match[1]) {
                                spotifyTrackId = match[1];
                                console.log(`[resolveTrackId] Found Spotify ID via MusicBrainz relation: ${spotifyTrackId}`);
                                break;
                            }
                        }
                    }
                }
                if (!spotifyTrackId) {
                    console.log(`[resolveTrackId] No direct Spotify ID found in MusicBrainz relations for "${song} by ${artist}".`);
                }
            } else {
                console.log(`[resolveTrackId] MusicBrainz search found no results for "${song} by ${artist}".`);
            }
        } catch (error) {
            console.error(`[resolveTrackId] MusicBrainz search failed for "${song} ${artist}":`, error);
        }
    }

    // 4. Cache the result
    resolvedTrackIds[cacheKey] = spotifyTrackId;
    localStorage.setItem('resolvedTrackIds', JSON.stringify(resolvedTrackIds));

    return spotifyTrackId;
}

/**
 * Adds a track to the user's listening history.
 * Prevents duplicate consecutive entries.
 * @param {string} userId - The ID of the user.
 * @param {string} song - The name of the song.
 * @param {string} artist - The name of the artist.
 * @param {string} token - Spotify access token.
 */
export async function addToHistory(userId, song, artist, token) {
    if (!token) {
        // Silently fail if spotify is not configured
        return;
    }

    const historyKey = `listeningHistory_${userId}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');

    // Prevent duplicate consecutive entries
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (lastEntry.song === song && lastEntry.artist === artist) {
            console.log(`[addToHistory] Skipping duplicate consecutive entry: ${song} by ${artist}`);
            return;
        }
    }

    const trackId = await resolveTrackId(song, artist, token);
    const newEntry = {
        id: trackId,
        artist: artist,
        song: song,
        timestamp: new Date().toISOString()
    };

    history.push(newEntry);
    localStorage.setItem(historyKey, JSON.stringify(history));
    console.log(`[addToHistory] Added to history: ${song} by ${artist} (ID: ${trackId}) for user ${userId}`);
}

/**
 * Reads the user’s history from localStorage and returns up to the last 5 track IDs.
 * @param {string} userId - The ID of the user.
 * @returns {string[]} - An array of up to 5 most recent Spotify track IDs.
 */
export function getLastFiveSeeds(userId) {
    const historyKey = `listeningHistory_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

    // Filter out entries without a Spotify ID and get the last 5 unique IDs
    const seeds = [];
    const uniqueIds = new Set(); // To ensure unique seeds
    for (let i = history.length - 1; i >= 0 && seeds.length < 5; i--) {
        const entry = history[i];
        if (entry.id && !uniqueIds.has(entry.id)) {
            seeds.unshift(entry.id); // Add to the beginning to maintain most recent first order
            uniqueIds.add(entry.id);
        }
    }
    console.log(`[getLastFiveSeeds] Retrieved seeds for user ${userId}:`, seeds);
    return seeds;
}

/**
 * Gets the last played track from the user's history.
 * @param {string} userId - The ID of the user.
 * @returns {string|null} - The Spotify track ID of the last played song, or null.
 */
export function getLastTrackSeed(userId) {
    const historyKey = `listeningHistory_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

    if (history.length > 0) {
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].id) {
                console.log(`[getLastTrackSeed] Retrieved seed for user ${userId}: ${history[i].id}`);
                return history[i].id;
            }
        }
    }
    return null;
}

/**
 * Gets music recommendations from Spotify based on the last played track.
 * @param {string} userId - The ID of the user.
 * @param {string} token - Spotify access token.
 * @returns {Promise<Array<Object>>} - An array of recommended tracks.
 */
export async function getRecommendationsFromHistory(userId, token) {
    if (!token) {
        console.log('[getRecommendationsFromHistory] Spotify token not available, returning empty array.');
        return [];
    }

    const seedTrack = getLastTrackSeed(userId);

    if (!seedTrack) {
        console.log('[getRecommendationsFromHistory] No seed track available, returning empty array.');
        return [];
    }

    try {
        const recommendationsUrl = `${API_URL}/api/recommendations?seed_tracks=${seedTrack}`;
        console.log(`[getRecommendationsFromHistory] Fetching recommendations from server with seed: ${seedTrack}`);
        const response = await fetch(recommendationsUrl);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.tracks && data.tracks.length > 0) {
            const recommendedTracks = data.tracks.map(track => ({
                id: track.id,
                name: track.name,
                artists: track.artists.map(artist => artist.name),
                coverUrl: track.album.images.length > 0 ? track.album.images[0].url : null,
                previewUrl: track.preview_url || null
            }));
            console.log('[getRecommendationsFromHistory] Successfully fetched recommendations.');
            return recommendedTracks;
        } else {
            console.log('[getRecommendationsFromHistory] Spotify returned no recommendations.');
            return [];
        }
    } catch (error) {
        console.error('[getRecommendationsFromHistory] Failed to get recommendations from Spotify:', error);
        return [];
    }
}
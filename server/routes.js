const { createServer } = require("http");
const axios = require('axios');
const SpotifyClient = require('./spotify');

const FreesoundClient = require('./freesound');
const config = require('../config.json');

const QOBUZ_API_BASE = "https://us.qobuz.squid.wtf/api";

async function registerRoutes(app) {
  const spotifyClient = config.apiKeys && config.apiKeys.enableSpotify && config.apiKeys.spotify !== "YOUR_SPOTIFY_API_KEY" && config.apiKeys.spotify_secret !== "YOUR_SPOTIFY_CLIENT_SECRET" ? new SpotifyClient(config.apiKeys.spotify, config.apiKeys.spotify_secret) : null;
  
  const freesoundClient = config.apiKeys && config.apiKeys.freesound !== "YOUR_FREESOUND_API_KEY" ? new FreesoundClient(config.apiKeys.freesound) : null;

  const BROWSER_HEADERS = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
    "priority": "u=1, i",
    "referer": "https://beta.dabmusic.xyz/",
    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
    "sec-ch-ua-arch": "\"x86\"",
    "sec-ch-ua-bitness": "\"64\"",
    "sec-ch-ua-full-version": "\"138.0.3351.121\"",
    "sec-ch-ua-full-version-list": "\"Not)A;Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"138.0.7204.184\", \"Microsoft Edge\";v=\"138.0.3351.121\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "\"\"",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-ch-ua-platform-version": "\"10.0.0\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
  };

  app.get("/api/music/search", async (req, res) => {
    try {
      const { q, offset = 0, limit = 20 } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.json({
          tracks: [],
          albums: [],
          artists: [],
          total: 0,
        });
      }
      
      const searchParams = new URLSearchParams({
        q: q.trim(),
        offset: offset.toString(),
        limit: limit.toString(),
      });

      const response = await axios.get(`${QOBUZ_API_BASE}/get-music`, { params: searchParams });
      const data = response.data;
      
      let tracks = [];
      let albums = [];
      let artists = [];
      
      if (data.data?.tracks?.items) {
        tracks = data.data.tracks.items.map((track) => ({
          id: track.id?.toString() || '',
          title: track.title || 'Unknown Title',
          artist: track.performer?.name || track.album?.artist?.name || 'Unknown Artist',
          album: track.album?.title || undefined,
          duration: track.duration || undefined,
          quality: track.maximum_bit_depth ? `${track.maximum_bit_depth}bit/${track.maximum_sampling_rate}kHz` : undefined,
          format: track.audio_info?.format || 'FLAC',
          coverUrl: track.album?.image?.large || track.album?.image?.small || undefined,
          streamUrl: `/api/music/stream/${track.id}`,
          downloadUrl: `/api/music/download/${track.id}?quality=27`,
          genre: track.album?.genre?.name || track.genre || undefined,
          year: track.album?.release_date_original ? new Date(track.album.release_date_original).getFullYear() : undefined,
          trackNumber: track.track_number || undefined,
          popularity: track.popularity || 0,
        }));
      }
      
      if (data.data?.albums?.items) {
        albums = data.data.albums.items.map((album) => ({
          id: album.id?.toString() || '',
          title: album.title || 'Unknown Album',
          artist: album.artist?.name || 'Unknown Artist',
          coverUrl: album.image?.large || album.image?.small || undefined,
          year: album.release_date_original ? new Date(album.release_date_original).getFullYear() : undefined,
          genre: album.genre?.name || undefined,
          trackCount: album.tracks_count || undefined,
        }));
      }
      
      if (data.data?.artists?.items) {
        artists = data.data.artists.items.map((artist) => ({
          id: artist.id?.toString() || '',
          name: artist.name || 'Unknown Artist',
          imageUrl: artist.image?.large || artist.image?.small || undefined,
          genre: artist.genre || undefined,
          popularity: artist.albums_count || 0,
        }));
      }

      const result = {
        tracks: tracks.length > 0 ? tracks : undefined,
        albums: albums.length > 0 ? albums : undefined,
        artists: artists.length > 0 ? artists : undefined,
        total: (data.data?.tracks?.total || 0) + (data.data?.albums?.total || 0) + (data.data?.artists?.total || 0),
      };

      res.json(result);
    } catch (error) {
      console.error('Music Search API Error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to search music',
        tracks: undefined,
        albums: undefined,
        artists: undefined,
        total: 0,
      });
    }
  });

  app.get("/api/music/search/quick", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.json({
          tracks: [],
          albums: [],
          total: 0,
        });
      }
      
      const searchParams = new URLSearchParams({
        q: q.trim(),
        offset: '0',
      });

      const response = await axios.get(`${QOBUZ_API_BASE}/get-music`, { params: searchParams });
      const data = response.data;
      
      let tracks = [];
      let albums = [];
      
      if (data.data?.tracks?.items) {
        tracks = data.data.tracks.items.slice(0, 5).map((track) => ({
          id: track.id?.toString() || '',
          title: track.title || 'Unknown Title',
          artist: track.performer?.name || track.album?.artist?.name || 'Unknown Artist',
          album: track.album?.title || undefined,
          duration: track.duration || undefined,
          coverUrl: track.album?.image?.small || undefined,
        }));
      }
      
      if (data.data?.albums?.items) {
        albums = data.data.albums.items.slice(0, 5).map((album) => ({
          id: album.id?.toString() || '',
          title: album.title || 'Unknown Album',
          artist: album.artist?.name || 'Unknown Artist',
          coverUrl: album.image?.small || undefined,
          trackCount: album.tracks_count || undefined,
        }));
      }

      const result = {
        tracks,
        albums,
        total: tracks.length + albums.length,
      };

      res.json(result);
    } catch (error) {
      console.error('Music Quick Search API Error:', error);
      res.status(500).json({ 
        tracks: [],
        albums: [],
        total: 0,
      });
    }
  });

  app.get("/api/music/track/:trackId", async (req, res) => {
    try {
      const { trackId } = req.params;
      
      if (!trackId) {
        return res.status(400).json({ message: 'Track ID parameter is required' });
      }

      const response = await axios.get(`${QOBUZ_API_BASE}/track/get`, { params: { track_id: trackId } });
      const data = response.data;

      const track = {
        id: data.id?.toString() || '',
        title: data.title || 'Unknown Title',
        artist: data.performer?.name || data.album?.artist?.name || 'Unknown Artist',
        album: data.album?.title || undefined,
        duration: data.duration || undefined,
        quality: data.maximum_bit_depth ? `${data.maximum_bit_depth}bit/${data.maximum_sampling_rate}kHz` : undefined,
        format: data.audio_info?.format || 'FLAC',
        coverUrl: data.album?.image?.large || data.album?.image?.small || undefined,
        streamUrl: `/api/music/stream/${data.id}`,
        downloadUrl: `/api/music/download/${data.id}?quality=27`,
        genre: data.album?.genre?.name || data.genre || undefined,
        year: data.album?.release_date_original ? new Date(data.album.release_date_original).getFullYear() : undefined,
        trackNumber: data.track_number || undefined,
        popularity: data.popularity || 0,
      };

      res.json(track);
    } catch (error) {
      console.error('Music Track Info API Error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get track info',
      });
    }
  });

  app.get("/api/music/album/:albumId", async (req, res) => {
    try {
      const { albumId } = req.params;
      
      if (!albumId) {
        return res.status(400).json({ message: 'Album ID parameter is required' });
      }

      const response = await axios.get(`${QOBUZ_API_BASE}/album/get`, { params: { album_id: albumId } });
      const data = response.data;

      const album = {
        id: data.id?.toString() || '',
        title: data.title || 'Unknown Album',
        artist: data.artist?.name || 'Unknown Artist',
        coverUrl: data.image?.large || data.image?.small || undefined,
        year: data.release_date_original ? new Date(data.release_date_original).getFullYear() : undefined,
        genre: data.genre?.name || undefined,
        trackCount: data.tracks_count || undefined,
        tracks: data.tracks.items.map((track) => ({
          id: track.id?.toString() || '',
          title: track.title || 'Unknown Title',
          artist: track.performer?.name || data.artist?.name || 'Unknown Artist',
          album: data.title || undefined,
          duration: track.duration || undefined,
          trackNumber: track.track_number || undefined,
        })),
      };

      res.json(album);
    } catch (error) {
      console.error('Album Details API Error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get album details',
      });
    }
  });

  app.get("/api/music/artist/:artistName/discography", async (req, res) => {
    try {
      const { artistName } = req.params;
      const { offset = 0, limit = 20 } = req.query;
      
      if (!artistName) {
        return res.status(400).json({ message: 'Artist name parameter is required' });
      }

      const searchParams = new URLSearchParams({
        q: artistName,
        type: 'artist',
        offset: offset.toString(),
        limit: limit.toString(),
      });

      const response = await axios.get(`${QOBUZ_API_BASE}/get-music`, { params: searchParams });
      const data = response.data;

      const albums = data.data.albums.items.map((album) => ({
        id: album.id?.toString() || '',
        title: album.title || 'Unknown Album',
        artist: album.artist?.name || 'Unknown Artist',
        coverUrl: album.image?.large || album.image?.small || undefined,
        year: album.release_date_original ? new Date(album.release_date_original).getFullYear() : undefined,
        genre: album.genre?.name || undefined,
        trackCount: album.tracks_count || undefined,
      }));

      const result = {
        items: albums,
        total: data.data.albums.total,
        hasMore: data.data.albums.total > (parseInt(offset) + parseInt(limit)),
        offset: parseInt(offset),
        limit: parseInt(limit),
      };

      res.json(result);
    } catch (error) {
      console.error('Artist Discography API Error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get artist discography',
        items: [],
        total: 0,
        hasMore: false,
      });
    }
  });

  app.get("/api/music/stream/:trackId", async (req, res) => {
    try {
      const { trackId } = req.params;
      if (!trackId) return res.status(400).json({ message: 'Track ID is required' });

      const dlMetaUrl = `${QOBUZ_API_BASE}/download-music?track_id=${encodeURIComponent(trackId)}&quality=27`;
      const dlMetaResp = await axios.get(dlMetaUrl, { headers: { 'Accept': 'application/json' } });
      const metaJson = dlMetaResp.data;
      if (!metaJson.success || !metaJson.data.url) {
        throw new Error('Failed to resolve stream URL');
      }
      const audioUrl = metaJson.data.url;

      const audioResp = await axios.get(audioUrl, { responseType: 'stream' });
      audioResp.data.pipe(res);
    } catch (error) {
      console.error('Streaming Error:', error);
      res.status(500).json({ message: 'Failed to stream audio' });
    }
  });
 
  app.get("/api/music/download/:trackId", async (req, res) => {
    try {
      const { trackId } = req.params;
      let { quality = "27", title, artist, inline } = req.query;
      if (!trackId) return res.status(400).json({ message: 'Track ID parameter is required' });

      if (quality !== "27" && quality !== "5") {
        quality = "27";
      }

      const dlMetaUrl = `${QOBUZ_API_BASE}/download-music?track_id=${encodeURIComponent(trackId)}&quality=${encodeURIComponent(quality)}`;
      const dlMetaResp = await axios.get(dlMetaUrl, { headers: { 'Accept': 'application/json' } });
      let audioUrl = dlMetaResp.data.data.url;

      if (!audioUrl) {
        return res.status(502).json({ message: 'Failed to resolve squid download URL' });
      }

      const audioResp = await axios.get(audioUrl, { responseType: 'stream' });

      const sanitize = (s) => (s ? String(s).replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, ' ').trim() : '');
      const ext = quality === "27" ? 'flac' : 'mp3';
      let filename = `track_${trackId}.${ext}`;
      if (title && artist) filename = `${sanitize(artist)} - ${sanitize(title)}.${ext}`;

      res.setHeader('Content-Type', quality === "27" ? 'audio/flac' : 'audio/mpeg');
      if (!inline) res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      audioResp.data.pipe(res);
    } catch (error) {
      console.error('Music Download API Error:', error);
      if (!res.headersSent) res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to download music' });
      else try { res.end(); } catch {}
    }
  });
 
  app.get("/api/spotify-token", async (req, res) => {
    try {
      const spotifyEnabled = config.apiKeys?.enableSpotify;
      if (!spotifyClient) {
        const message = spotifyEnabled ? 'Spotify API keys are invalid or missing in config.json.' : 'Spotify integration is disabled in config.json.';
        return res.status(503).json({ message });
      }
      const token = await spotifyClient.getAccessToken();
      res.json({ accessToken: token });
    } catch (error) {
      console.error('Error getting Spotify token from server:', error);
      res.status(500).json({ message: 'Internal server error while getting Spotify access token.' });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      const spotifyEnabled = config.apiKeys?.enableSpotify;
      if (!spotifyClient) {
        const message = spotifyEnabled ? 'Spotify API keys are invalid or missing in config.json.' : 'Spotify integration is disabled in config.json.';
        return res.status(503).json({ message });
      }
      const { seed_tracks } = req.query;
      const recommendations = await spotifyClient.getRecommendations({ seed_tracks });
      res.json(recommendations);
    } catch (error) {
      console.error('Recommendations API Error:', error);
      res.status(500).json({ message: 'Failed to get recommendations.' });
    }
  });

  app.get("/api/spotify/search", async (req, res) => {
    try {
      const { artist, title } = req.query;
      if (!artist || !title) {
        return res.status(400).json({ message: 'Artist and title are required for Spotify search.' });
      }
      const trackId = await spotifyClient.searchTrack(artist, title);
      res.json({ trackId });
    } catch (error) {
      console.error('Spotify Search API Error:', error);
      res.status(500).json({ message: 'Failed to search on Spotify.' });
    }
  });

  app.get("/api/genre-tracks", async (req, res) => {
    try {
      const { genre } = req.query;
      res.json({ tracks: [] });
    } catch (error) {
      console.error('Genre Tracks API Error:', error);
      res.status(500).json({ message: 'Failed to get genre tracks' });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: 'ok',
      message: 'Meowtify backend is running',
      timestamp: new Date().toISOString(),
      spotifyEnabled: !!config.apiKeys?.enableSpotify
    });
  });
 
  app.get("/api/lyrics", async (req, res) => {
    try {
        const { artist, title } = req.query;
        if (!artist || !title) {
            return res.status(400).json({ message: 'Artist and title are required' });
        }

        const response = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
        res.json({ lyrics: response.data.lyrics });
    } catch (error) {
        console.error('Lyrics API Error:', error);
        res.status(500).json({ message: 'Failed to get lyrics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
 
module.exports = { registerRoutes };

const axios = require('axios');

class SpotifyClient {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.tokenExpiresIn = 0;
        this.tokenObtainedTime = 0;
    }

    async getAccessToken() {
        if (this.accessToken && (Date.now() - this.tokenObtainedTime) < (this.tokenExpiresIn * 1000 - 60000)) {
            return this.accessToken;
        }

        if (!this.clientId || !this.clientSecret) {
            console.error('Spotify client ID or client secret are not configured in config.json.');
            return null;
        }

        console.log('Fetching new Spotify access token...');
        const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;
            this.accessToken = data.access_token;
            this.tokenExpiresIn = data.expires_in;
            this.tokenObtainedTime = Date.now();
            console.log('Spotify access token obtained successfully.');
            return this.accessToken;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            this.accessToken = null;
            throw error;
        }
    }

    async getRecommendations(options) {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('Spotify access token not available.');
        }

        const { seed_tracks } = options;
        if (!seed_tracks) {
            throw new Error('Seed tracks are required for recommendations.');
        }

        const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${seed_tracks}&limit=10`;
        console.log(`Making Spotify recommendations request to: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Meowtify/1.0'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting Spotify recommendations:', error.response ? error.response.data : error.message);
            throw new Error('Failed to get recommendations from Spotify.');
        }
    }

    async searchTrack(artist, title) {
        const token = await this.getAccessToken();
        if (!token) {
            throw new Error('Spotify access token not available.');
        }
        const url = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(title)}%20artist:${encodeURIComponent(artist)}&type=track&limit=1`;
        console.log(`Searching Spotify for ${title} by ${artist}`);
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.tracks.items.length > 0) {
                return response.data.tracks.items[0].id;
            }
            return null;
        } catch (error) {
            console.error('Error searching Spotify track:', error.response ? error.response.data : error.message);
            throw new Error('Failed to search Spotify track.');
        }
    }
}

module.exports = SpotifyClient;
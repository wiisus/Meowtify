import { addToHistory, getLastFiveSeeds, getRecommendationsFromHistory, resolveTrackId } from './recommendation_module.js';

export const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Check for logged-in user and redirect if not found
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        window.location.href = 'login.html';
        return; // Stop further execution of this script
    }

    // Display logged-in user ID in settings
    const settingsLoggedInUserIdDisplay = document.getElementById('settings-logged-in-user-id');
    if (settingsLoggedInUserIdDisplay) {
        settingsLoggedInUserIdDisplay.textContent = loggedInUserId;
    }

    // Example: Add a logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUserId'); // Clear user ID
            // Optionally clear listening history for this user if desired, or keep it
            // localStorage.removeItem(`listeningHistory_${loggedInUserId}`);
            window.location.href = 'login.html'; // Redirect to login page
        });
    }

    // Example of how you might add a song to listening history from the main app
    // This would typically be triggered when a song finishes playing or is explicitly added
    // This function is now handled by the imported addToHistory from recommendation_module.js
    // function addSongToListingHistory(artist, song) {
    //     const currentUserId = localStorage.getItem('loggedInUserId');
    //     // IMPORTANT: Replace 'YOUR_SPOTIFY_ACCESS_TOKEN' with a valid Spotify access token.
    //     // WARNING: Hardcoding tokens in client-side code is INSECURE for production environments.
    //     // For a real application, implement Spotify's OAuth 2.0 flow on your backend to securely obtain and manage tokens.
    //     const spotifyAccessToken = '87731d51c14045c4b8ce8d82d13252b2';
    //     if (currentUserId) {
    //         const historyKey = `listeningHistory_${currentUserId}`;
    //         const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    //         history.push({ artist, song, timestamp: new Date().toISOString() });
    //         localStorage.setItem(historyKey, JSON.stringify(history));
    //         console.log(`Added "${song}" by ${artist} to history for user ${currentUserId}`);
    //     }
    // }

    let spotifyAccessToken = null; // Make it mutable


    async function getAndRefreshSpotifyToken() {
        try {
            const response = await fetch(`${API_URL}/api/spotify-token`);
            if (!response.ok) {
                throw new Error(`Failed to fetch Spotify token: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            spotifyAccessToken = data.accessToken;
            console.log('Spotify access token obtained from server.');

            // Refresh token before it expires (e.g., every 50 minutes for a 1-hour token)
            setTimeout(getAndRefreshSpotifyToken, 50 * 60 * 1000);
        } catch (error) {
            console.error('Error getting or refreshing Spotify token:', error);
            spotifyAccessToken = null; // Clear token on error
            // Retry after a delay if there was an error
            setTimeout(getAndRefreshSpotifyToken, 5 * 60 * 1000); // Retry after 5 minutes
        }
    }

    // Call this when the app starts
    getAndRefreshSpotifyToken();

    // --- Start of Meowtify App Logic from script2.js ---
    // --- App State ---
    let tracks = [];
    let currentTrack = null;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 'none'; // none, one, all
    let likedSongs = new Set();
    let playlists = {};
    let lastSearchQuery = '';
    let lastSearchResults = {};

    // --- DOM Elements ---
    const contentArea = document.querySelector('.content-area');
    const searchInput = document.querySelector('.search-input');
    const playerBar = document.querySelector('.player-bar');
    const nowPlayingCover = document.querySelector('.now-playing img');
    const nowPlayingTitle = document.querySelector('.track-info h4');
    const nowPlayingArtist = document.querySelector('.track-info p');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const progressThumb = document.querySelector('.progress-thumb');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeFill = document.querySelector('.volume-fill');
    const volumeThumb = document.querySelector('.volume-thumb');
    const muteBtn = document.getElementById('mute-btn');
    const lyricsBtn = document.getElementById('lyrics-btn');
    const nowPlayingOverlay = document.getElementById('now-playing-overlay');
    const closeOverlayBtn = document.querySelector('.close-overlay-btn');
    const contextMenu = document.getElementById('contextMenu');

    // --- Audio Player ---
    const audio = new Audio();

    // --- API ---

    async function fetchWithRetry(url, options = {}, retries = 3, delay = 2000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Attempt ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error(`Failed to fetch from ${url} after ${retries} attempts.`);
    }

    // --- Page Rendering ---
    function navigateTo(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === page);
        });

        switch (page) {
            case 'home':
                renderHomePage();
                break;
            case 'search':
                renderSearchPage(true);
                break;
            case 'library':
                renderLibraryPage();
                break;
            case 'playlists':
                renderPlaylistsPage();
                break;
        }
    }

    async function renderHomePage() { // Make it async
        contentArea.innerHTML = `
            <div class="section-title">Featured Music</div>
            <div class="tracks-grid featured-music-grid"></div>
            <div class="section-title">Recommended for You</div>
            <div class="tracks-grid recommendations-grid"></div>
        `;
        loadTracks(); // Still load featured music

        const recommendationsGrid = document.querySelector('.recommendations-grid');
        if (loggedInUserId && spotifyAccessToken) {
            try {
                const recommendedTracks = await getRecommendationsFromHistory(loggedInUserId, spotifyAccessToken);
                if (recommendedTracks.length > 0) {
                    renderTracks(recommendationsGrid, recommendedTracks);
                } else {
                    recommendationsGrid.innerHTML = '<p>Listen to more music to get recommendations!</p>';
                }
            } catch (error) {
                recommendationsGrid.innerHTML = '<p class="error-message">Failed to load recommendations.</p>';
                console.error('Error loading recommendations:', error);
            }
        } else {
            recommendationsGrid.innerHTML = '<p>Log in to get personalized recommendations!</p>';
        }
    }

    function renderSearchPage(fromNavigation = false) {
        if (fromNavigation && contentArea.querySelector('.search-results')) {
            return;
        }
        contentArea.innerHTML = `
            <div class="section-title">Search</div>
            <div class="search-categories">
                <div class="category-card">Pop</div>
                <div class="category-card">Chill</div>
                <div class="category-card">Workout</div>
                <div class="category-card">Rock</div>
                <div class="category-card">Hip-Hop</div>
            </div>
            <div class="search-results"></div>
        `;
        searchInput.value = lastSearchQuery;
        renderSearchResults(lastSearchResults);
    }

    function renderLibraryPage() {
        contentArea.innerHTML = `
            <div class="section-title">Your Library</div>
            <div class="tracks-grid"></div>
        `;
        const likedTracks = tracks.filter(t => likedSongs.has(t.id));
        renderTracks(document.querySelector('.tracks-grid'), likedTracks);
    }

    function renderPlaylistsPage() {
        contentArea.innerHTML = `
            <div class="section-title">Playlists</div>
            <div class="playlists-grid"></div>
        `;
        // TODO: Render playlists
    }

    function renderTracks(container, tracksToRender) {
        if (!container) return;
        if (!tracksToRender || tracksToRender.length === 0) {
            container.innerHTML = '<p>No tracks found.</p>';
            return;
        }

        container.innerHTML = tracksToRender.map(track => `
            <div class="track-card" data-track-id="${track.id}">
                <img src="${track.coverUrl}" alt="${track.title}">
                <div class="play-button-overlay"><i class="icon-play"></i></div>
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
                <button class="like-btn ${likedSongs.has(track.id) ? 'active' : ''}" data-track-id="${track.id}"><i class="icon-like"></i></button>
            </div>
        `).join('');

        container.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) return;
                const trackId = card.dataset.trackId;
                const track = tracks.find(t => t.id === trackId);
                if (track) {
                    playTrack(track);
                }
            });

            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.dataset.trackId = card.dataset.trackId;
            });
        });

        container.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const trackId = btn.dataset.trackId;
                toggleLike(trackId);
                btn.classList.toggle('active', likedSongs.has(trackId));
            });
        });
    }

    function renderSearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;

        let html = '';
        if (results.tracks && results.tracks.length > 0) {
            html += '<h3>Tracks</h3>';
            html += '<div class="tracks-grid">';
            html += results.tracks.map(track => `
                <div class="track-card" data-track-id="${track.id}">
                    <img src="${track.coverUrl}" alt="${track.title}">
                    <div class="play-button-overlay"><i class="icon-play"></i></div>
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                    <button class="like-btn ${likedSongs.has(track.id) ? 'active' : ''}" data-track-id="${track.id}"><i class="icon-like"></i></button>
                </div>
            `).join('');
            html += '</div>';
        }

        // TODO: Add rendering for albums and artists

        searchResults.innerHTML = html;

        searchResults.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) return;
                const trackId = card.dataset.trackId;
                const track = results.tracks.find(t => t.id === trackId);
                if (track) {
                    playTrack(track);
                }
            });
        });
    }

    // --- Event Listeners ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.section);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        lastSearchQuery = query;
        if (document.querySelector('.nav-item[data-section=search]').classList.contains('active')) {
            search(query);
        }
    });

    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextTrack);
    prevBtn.addEventListener('click', playPrevTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', cycleRepeat);
    muteBtn.addEventListener('click', toggleMute);
    lyricsBtn.addEventListener('click', toggleLyricsOverlay);
    closeOverlayBtn.addEventListener('click', toggleLyricsOverlay);

    progressBar.addEventListener('mousedown', (e) => {
        seek(e);
        document.addEventListener('mousemove', seek);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', seek);
        });
    });

    volumeSlider.addEventListener('mousedown', (e) => {
        volumeSlider.classList.add('active');
        setVolume(e);
        const moveHandler = (e) => {
            setVolume(e);
        };
        const upHandler = () => {
            volumeSlider.classList.remove('active');
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onTrackEnd);

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const trackId = contextMenu.dataset.trackId;
        if (action === 'add-to-playlist') {
            // TODO: Implement add to playlist functionality
            console.log('Add to playlist', trackId);
        }
        contextMenu.style.display = 'none';
    });

    // --- Music Playback ---
    function playTrack(track) {
        currentTrack = track;
        nowPlayingCover.src = track.coverUrl;
        nowPlayingTitle.textContent = track.title;
        nowPlayingArtist.textContent = track.artist;

        audio.src = `${API_URL}/api/music/stream/${track.id}`;
        audio.play();
        isPlaying = true;
        updatePlayPauseButton();
        updateNowPlayingOverlay(track);
        // Add to listening history when a track starts playing
        addToHistory(loggedInUserId, track.title, track.artist, spotifyAccessToken);
    }

    function togglePlayPause() {
        if (!currentTrack) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        playPauseBtn.innerHTML = `<i class="icon-${isPlaying ? 'pause' : 'play'}"></i>`;
    }

    function updateProgress() {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progressPercent}%`;
            progressThumb.style.left = `${progressPercent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function playNextTrack() {
        if (!currentTrack) return;
        let currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        let nextIndex;

        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
            nextIndex = (currentIndex + 1) % tracks.length;
        }
        
        playTrack(tracks[nextIndex]);
    }

    function playPrevTrack() {
        if (!currentTrack) return;
        let currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        let prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        playTrack(tracks[prevIndex]);
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        const icon = shuffleBtn.querySelector('i');
        icon.textContent = isShuffle ? 'shuffle_on' : 'shuffle';
    }

    function cycleRepeat() {
        const icon = repeatBtn.querySelector('i');
        if (repeatMode === 'none') {
            repeatMode = 'all';
            repeatBtn.classList.add('active');
            icon.textContent = 'repeat_on';
        } else if (repeatMode === 'all') {
            repeatMode = 'one';
            icon.textContent = 'repeat_one_on';
        } else {
            repeatMode = 'none';
            repeatBtn.classList.remove('active');
            icon.textContent = 'repeat';
        }
    }

    function onTrackEnd() {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        }
    }

    function toggleMute() {
        audio.muted = !audio.muted;
        muteBtn.innerHTML = `<i class="icon-${audio.muted ? 'volume_up' : 'mute'}"></i>`;
    }

    function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    function setVolume(e) {
        const rect = volumeSlider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        let volume = clickX / width;
        volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        audio.volume = volume;
        volumeFill.style.width = `${volume * 100}%`;
        if (volumeThumb) {
            volumeThumb.style.left = `${volume * 100}%`;
        }
    }

    function toggleLyricsOverlay() {
        if (currentTrack) {
            nowPlayingOverlay.classList.toggle('hidden');
        }
    }

    function updateNowPlayingOverlay(track) {
        const overlayAlbumCover = nowPlayingOverlay.querySelector('.overlay-album-cover');
        const overlayTrackTitle = nowPlayingOverlay.querySelector('.overlay-track-info h2');
        const overlayTrackArtist = nowPlayingOverlay.querySelector('.overlay-track-info h3');
        const lyricsContainer = nowPlayingOverlay.querySelector('.lyrics-container');

        overlayAlbumCover.src = track.coverUrl;
        overlayTrackTitle.textContent = track.title;
        overlayTrackArtist.textContent = track.artist;

        lyricsContainer.innerHTML = 'Loading lyrics...';
        fetchWithRetry(`${API_URL}/api/lyrics?artist=${track.artist}&title=${track.title}`)
            .then(lyrics => {
                if (lyrics.lyrics) {
                    lyricsContainer.innerHTML = lyrics.lyrics.replace(/\n/g, '<br>');
                } else {
                    lyricsContainer.innerHTML = 'No lyrics found for this track.';
                }
            })
            .catch(() => {
                lyricsContainer.innerHTML = 'Failed to load lyrics.';
            });
    }

    function toggleLike(trackId) {
        if (likedSongs.has(trackId)) {
            likedSongs.delete(trackId);
        } else {
            likedSongs.add(trackId);
        }
    }

    // --- Data Loading ---
    async function loadTracks() {
        const tracksGrid = document.querySelector('.tracks-grid');
        try {
            const response = await fetchWithRetry(`${API_URL}/api/music/search?q=top%20hits`);
            tracks = response.tracks;
            renderTracks(tracksGrid, tracks);
        } catch (error) {
            tracksGrid.innerHTML = '<p class="error-message">Failed to load tracks. Please try again later.</p>';
            console.error(error);
        }
    }

    async function search(query) {
        if (query.length < 2) {
            lastSearchResults = {};
            renderSearchResults(lastSearchResults);
            return;
        }

        try {
            const response = await fetchWithRetry(`${API_URL}/api/music/search?q=${query}`);
            lastSearchResults = response;
            renderSearchResults(lastSearchResults);
        } catch (error) {
            console.error(error);
            const searchResults = document.querySelector('.search-results');
            if(searchResults){
                searchResults.innerHTML = '<p class="error-message">Failed to perform search. Please try again later.</p>';
            }
        }
    }

    // --- Initial Load ---
    navigateTo('home');
    // --- End of Meowtify App Logic from script2.js ---
});
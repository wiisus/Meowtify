const styleSheet = document.createElement("style");
styleSheet.innerText = `
.icon-button i {
    font-feature-settings: 'liga';
    overflow: hidden;
}
.icon-more::before {
    content: 'more_horiz';
    overflow: hidden;
}
#create-playlist-icon-btn i {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 32px;
    line-height: 1;
}
#create-playlist-icon-btn i::before {
    content: 'add_circle';
}
.top-bar-buttons .icon-like-filled::before {
    content: 'favorite';
    color: var(--accent-color);
}
`

document.head.appendChild(styleSheet);


export const API_URL = '';

import { addToHistory, getRecommendationsFromHistory } from './recommendation_module.js';

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        window.location.href = 'login.html';
        return;
    }

    const settingsLoggedInUserIdDisplay = document.getElementById('settings-logged-in-user-id');
    if (settingsLoggedInUserIdDisplay) {
        settingsLoggedInUserIdDisplay.textContent = loggedInUserId;
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        });
    }

    let spotifyAccessToken = null;
    let spotifyEnabled = false;


    async function getAndRefreshSpotifyToken() {
        try {
            const response = await fetch(`${API_URL}/api/spotify-token`);
            if (!response.ok) {
                throw new Error(`Failed to fetch Spotify token: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            spotifyAccessToken = data.accessToken;
            console.log('Spotify access token obtained from server.');

            setTimeout(getAndRefreshSpotifyToken, 50 * 60 * 1000);
        } catch (error) {
            console.error('Could not get Spotify token:', error.message);
            spotifyAccessToken = null;
        }
    }

    async function initializeApp() {
        try {
            const healthResponse = await fetch(`${API_URL}/api/health`);
            const healthData = await healthResponse.json();
            spotifyEnabled = healthData.spotifyEnabled;
        } catch (error) {
            console.error('Could not fetch server configuration. Disabling integrations.', error);
            spotifyEnabled = false;
        }

        await loadInitialTracks();

        if (spotifyEnabled) {
            await getAndRefreshSpotifyToken();
        } else {
            console.log('Spotify integration is disabled by server configuration. No token will be fetched.');
        }

        renderHomePage();
    }

    initializeApp();

    let tracks = [];
    let currentTrack = null;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 'none';
    let likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs') || '[]'));
    let playlists = {};
    let lastSearchQuery = '';
    let lastSearchResults = {};
    let historyStack = [];
    let forwardStack = [];
    const contentArea = document.querySelector('.content-area');
    const searchInput = document.querySelector('.search-input');
    const playerBar = document.querySelector('.player-bar');
    const nowPlayingCover = document.querySelector('.now-playing img');
    const nowPlayingTitle = document.querySelector('.track-info h4');
    const nowPlayingArtist = document.querySelector('.track-info p');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const likeBtnTopBar = document.getElementById('likeBtn');
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
    const playlistContextMenu = document.getElementById('playlistContextMenu');
    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    const closePlaylistModalBtn = addToPlaylistModal.querySelector('#close-playlist-modal-btn');
    const newPlaylistFromModalBtn = document.getElementById('new-playlist-from-modal-btn');
    const createPlaylistModal = document.getElementById('create-playlist-modal');
    const closeCreatePlaylistModalBtn = document.getElementById('close-create-playlist-modal-btn');
    const createPlaylistSubmitBtn = document.getElementById('create-playlist-submit-btn');
    const promptModal = document.getElementById('prompt-modal');
    const promptModalTitle = document.getElementById('prompt-modal-title');
    const promptModalInput = document.getElementById('prompt-modal-input');
    const promptModalSubmitBtn = document.getElementById('prompt-modal-submit-btn');
    const promptModalCancelBtn = document.getElementById('prompt-modal-cancel-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const audio = new Audio();

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

    function navigateTo(page, fromHistory = false) {
        const currentPage = location.hash.substring(1) || 'home';

        if (!fromHistory && page !== currentPage) {
            historyStack.push(currentPage);
            forwardStack = [];
        }

        location.hash = page;
        updateNavButtons();

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
            default:
                if (page.startsWith('playlist-')) renderPlaylistDetailPage(page.split('-')[1]);
        }
    }

    async function renderHomePage() {
        const recentlyPlayed = getRecentlyPlayed();
        contentArea.innerHTML = `
            <div class="section-title">Recently Played</div>
            <div class="tracks-grid recently-played-grid"></div>
        `;
        const recentlyPlayedGrid = document.querySelector('.recently-played-grid');
        if (recentlyPlayed.length > 0) {
            renderTracks(recentlyPlayedGrid, recentlyPlayed);
        } else {
            recentlyPlayedGrid.innerHTML = '<p>Your recently played songs will appear here.</p>';
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
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.textContent;
                searchInput.value = category;
                search(category);
            });
        });
        renderSearchResults(lastSearchResults);
    }

    function renderLibraryPage() {
        contentArea.innerHTML = `
            <div class="section-title">Liked Songs</div>
            <div class="tracks-grid"></div>
        `;
        const likedTracks = tracks.filter(t => likedSongs.has(t.id));
        renderTracks(document.querySelector('.tracks-grid'), likedTracks);
    }

    function renderPlaylistsPage() {
        contentArea.innerHTML = `
            <div class="section-title-container">
                <div class="section-title">Playlists</div>
                <button id="create-playlist-icon-btn" title="Create Playlist"><i></i></button>
            </div>
            <div class="playlists-grid"></div>
        `;
        const playlistsGrid = contentArea.querySelector('.playlists-grid');
        const playlistIds = Object.keys(playlists);

        const playlistsHTML = playlistIds.map(id => {
            const playlist = playlists[id];
            const playlistTracks = playlist.trackIds.map(trackId => tracks.find(t => t.id === trackId)).filter(Boolean);
            
            let coverHTML;
            if (playlist.customCoverUrl) {
                coverHTML = `<img src="${playlist.customCoverUrl}" alt="${playlist.name}" style="position: absolute; top: 0; left: 0; width:100%; height:100%; object-fit:cover;">`;
            } else if (playlistTracks.length === 0) {
                coverHTML = `<i class="icon-playlist"></i>`;
            } else {
                const coverImages = playlistTracks.slice(0, 4).map(t => `<img src="${t.coverUrl}" alt="">`).join('');
                coverHTML = `<div class="playlist-card-cover-grid">${coverImages}</div>`;
            }
            
            return `
                <div class="playlist-card" data-playlist-id="${playlist.id}">
                    <div class="playlist-card-cover">${coverHTML}</div>
                    <h4>${playlist.name}</h4>
                    <p>${playlist.description || `${playlist.trackIds.length} songs`}</p>
                </div>
            `;
        }).join('');

        playlistsGrid.innerHTML = playlistsHTML;

        document.getElementById('create-playlist-icon-btn').addEventListener('click', openCreatePlaylistModal);

        playlistsGrid.querySelectorAll('.playlist-card').forEach(card => {
            if (card.classList.contains('create-playlist-card')) return;
            card.addEventListener('click', () => {
                navigateTo(`playlist-${card.dataset.playlistId}`);
            });

            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                playlistContextMenu.style.display = 'block';
                playlistContextMenu.style.left = `${e.pageX}px`;
                playlistContextMenu.style.top = `${e.pageY}px`;
                playlistContextMenu.dataset.playlistId = card.dataset.playlistId;
            });
        });
    }

    function renderPlaylistDetailPage(playlistId) {
        const playlist = playlists[playlistId];
        if (!playlist) {
            navigateTo('playlists');
            return;
        }
        
        const playlistTracks = playlist.trackIds.map(trackId => tracks.find(t => t.id === trackId)).filter(Boolean);

        let coverHTML;
        if (playlist.customCoverUrl) {
            coverHTML = `<img src="${playlist.customCoverUrl}" alt="${playlist.name}" style="width:100%; height:100%; object-fit:cover;">`;
        } else if (playlistTracks.length === 0) {
            coverHTML = `<i class="icon-playlist"></i>`;
        } else {
            const coverImages = playlistTracks.slice(0, 4).map(t => `<img src="${t.coverUrl}" alt="">`).join('');
            coverHTML = `<div class="playlist-card-cover-grid">${coverImages}</div>`;
        }

        contentArea.innerHTML = `
            <div class="playlist-detail-header">
                <div class="playlist-card-cover playlist-detail-cover">${coverHTML}</div>
                <div class="playlist-detail-info">
                    <p>Playlist</p>
                    <h1>${playlist.name}</h1>
                    <p>${playlist.description ? `${playlist.description} • ` : ''}${playlistTracks.length} songs</p>
                </div>
            </div>
            <div class="tracks-grid"></div>
        `;

        const tracksGrid = contentArea.querySelector('.tracks-grid');
        renderTracks(tracksGrid, playlistTracks, { onPlaylist: true, playlistId: playlistId, isDraggable: true });

        let draggedItem = null;

        tracksGrid.addEventListener('dragstart', e => {
            if (e.target.classList.contains('track-card')) {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.style.opacity = '0.5';
                }, 0);
            }
        });

        tracksGrid.addEventListener('dragend', e => {
            if (draggedItem) {
                setTimeout(() => {
                    draggedItem.style.opacity = '';
                    draggedItem = null;
                }, 0);
            }
        });

        tracksGrid.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(tracksGrid, e.clientY);
            if (afterElement == null) {
                tracksGrid.appendChild(draggedItem);
            } else {
                tracksGrid.insertBefore(draggedItem, afterElement);
            }
        });

        tracksGrid.addEventListener('drop', e => {
            e.preventDefault();
            updatePlaylistOrder(playlistId, tracksGrid);
        });
    }
    
    function renderTracks(container, tracksToRender, context = {}) {
        if (!container) return;
        if (!tracksToRender || tracksToRender.length === 0) {
            container.innerHTML = context.onPlaylist ? '<p>This playlist is empty.</p>' : '<p>No tracks found.</p>';
            return;
        }

        container.innerHTML = tracksToRender.map(track => `
            <div class="track-card" data-track-id="${track.id}" ${context.isDraggable ? 'draggable="true"' : ''}>
                <img src="${track.coverUrl}" alt="${track.title}">
                <div class="play-button-overlay"><i class="icon-play"></i></div>
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
                <button class="more-options-btn" data-track-id="${track.id}"><i class="icon-more"></i></button>
            </div>
        `).join('');

        container.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.more-options-btn')) return;

                const trackId = card.dataset.trackId;
                let track = tracksToRender.find(t => t.id === trackId);

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

        container.querySelectorAll('.more-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (contextMenu.style.display === 'block' && contextMenu.dataset.trackId === btn.dataset.trackId) {
                    contextMenu.style.display = 'none';
                    return;
                }

                const trackId = btn.dataset.trackId;
                const likeOption = contextMenu.querySelector('[data-action="toggle-like"]');
                if (likeOption) {
                    likeOption.textContent = likedSongs.has(trackId) ? 'Remove from Liked Songs' : 'Add to Liked Songs';
                }

                let removeFromPlaylistOption = contextMenu.querySelector('[data-action="remove-from-playlist"]');
                if (context.onPlaylist) {
                    if (!removeFromPlaylistOption) {
                        const ul = contextMenu.querySelector('ul');
                        if (ul) {
                            removeFromPlaylistOption = document.createElement('li');
                            removeFromPlaylistOption.dataset.action = 'remove-from-playlist';
                            ul.insertBefore(removeFromPlaylistOption, ul.children[1]);
                        }
                    }
                    removeFromPlaylistOption.textContent = 'Remove from this playlist';
                    removeFromPlaylistOption.style.display = 'list-item';
                } else if (removeFromPlaylistOption) {
                    removeFromPlaylistOption.style.display = 'none';
                }
                const rect = btn.getBoundingClientRect();
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${rect.right - contextMenu.offsetWidth}px`;
                contextMenu.style.top = `${rect.bottom}px`;
                contextMenu.dataset.trackId = trackId;
                contextMenu.dataset.playlistId = context.playlistId || '';
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
                    <button class="more-options-btn" data-track-id="${track.id}"><i class="icon-more"></i></button>
                </div>
            `).join('');
            html += '</div>';
        }

        searchResults.innerHTML = html;

        searchResults.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.more-options-btn')) return;
                const trackId = card.dataset.trackId;
                const track = results.tracks.find(t => t.id === trackId);
                if (track) {
                    if (!tracks.some(t => t.id === track.id)) {
                        tracks.push(track);
                    }
                    playTrack(track);
                }
            });
        });

        searchResults.querySelectorAll('.more-options-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (contextMenu.style.display === 'block' && contextMenu.dataset.trackId === btn.dataset.trackId) {
                    contextMenu.style.display = 'none';
                    return;
                }

                const trackId = btn.dataset.trackId;
                const likeOption = contextMenu.querySelector('[data-action="toggle-like"]');
                if (likeOption) {
                    likeOption.textContent = likedSongs.has(trackId) ? 'Remove from Liked Songs' : 'Add to Liked Songs';
                }

                const removeFromPlaylistOption = contextMenu.querySelector('[data-action="remove-from-playlist"]');
                if (removeFromPlaylistOption) {
                    removeFromPlaylistOption.style.display = 'none';
                }

                const rect = btn.getBoundingClientRect();
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${rect.right - contextMenu.offsetWidth}px`;
                contextMenu.style.top = `${rect.bottom}px`;
                contextMenu.dataset.trackId = trackId;
                contextMenu.dataset.playlistId = '';
            });
        });

        searchResults.querySelectorAll('.track-card').forEach(card => {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.dataset.trackId = card.dataset.trackId;
            });
        });

        if (results.tracks) {
            tracks = [...new Map([...tracks, ...results.tracks].map(item => [item['id'], item])).values()];
        }
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.section);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        lastSearchQuery = query;

        if (!document.querySelector('.nav-item[data-section="search"]').classList.contains('active')) {
            navigateTo('search');
        }
        search(query);
    });

    let searchTimeoutId;
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextTrack);
    prevBtn.addEventListener('click', playPrevTrack);
    backBtn.addEventListener('click', goBack);
    forwardBtn.addEventListener('click', goForward);
    likeBtnTopBar.addEventListener('click', toggleCurrentTrackLike);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', cycleRepeat);
    muteBtn.addEventListener('click', toggleMute);
    lyricsBtn.addEventListener('click', toggleLyricsOverlay);
    closeOverlayBtn.addEventListener('click', toggleLyricsOverlay);

    closePlaylistModalBtn.addEventListener('click', closeAddToPlaylistModal);
    newPlaylistFromModalBtn.addEventListener('click', createPlaylistFromModal);
    
    closeCreatePlaylistModalBtn.addEventListener('click', closeCreatePlaylistModal);
    createPlaylistSubmitBtn.addEventListener('click', handleCreatePlaylistSubmit);

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
        if (!contextMenu.contains(e.target) && !e.target.closest('.more-options-btn')) {
            contextMenu.style.display = 'none';
        }
        if (!playlistContextMenu.contains(e.target) && !e.target.closest('.playlist-card')) {
            playlistContextMenu.style.display = 'none';
        }
    });

    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const trackId = contextMenu.dataset.trackId;
        if (action === 'toggle-like') {
            toggleLike(trackId);
            if (document.querySelector('.nav-item[data-section=library]').classList.contains('active')) {
                renderLibraryPage();
            }
        } else if (action === 'remove-from-playlist') {
            const playlistId = contextMenu.dataset.playlistId;
            if (playlistId && trackId) {
                removeTrackFromPlaylist(trackId, playlistId);
            }
        } else if (action === 'add-to-playlist') {
            openAddToPlaylistModal(trackId);
        }
        contextMenu.style.display = 'none';
    });

    playlistContextMenu.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        const playlistId = playlistContextMenu.dataset.playlistId;
        playlistContextMenu.style.display = 'none';

        if (action === 'edit-playlist') {
            openEditPlaylistModal(playlistId);
        } else if (action === 'delete-playlist') {
            const confirmed = await showConfirmModal('Delete Playlist', `Are you sure you want to delete "${playlists[playlistId].name}"? This cannot be undone.`);
            if (confirmed) {
                delete playlists[playlistId];
                savePlaylists();
                if (location.hash === `#playlist-${playlistId}`) {
                    navigateTo('playlists');
                } else {
                    renderPlaylistsPage();
                }
            }
        }

    });

    function playTrack(track) {
        currentTrack = track;
        nowPlayingCover.src = track.coverUrl;
        nowPlayingTitle.textContent = track.title;
        nowPlayingArtist.textContent = track.artist;

        if (!tracks.some(t => t.id === track.id)) {
            tracks.push(track);
        }

        audio.src = `${API_URL}/api/music/stream/${track.id}`;
        audio.play();
        isPlaying = true;
        updatePlayPauseButton();
        updateTopBarLikeButton();
        updateNowPlayingOverlay(track);
        if (spotifyAccessToken) {
            addToHistory(loggedInUserId, track.title, track.artist, spotifyAccessToken);
        }
        addToRecentlyPlayed(track);
    }

    function toggleCurrentTrackLike() {
        if (currentTrack) {
            toggleLike(currentTrack.id);
            updateTopBarLikeButton();
        }
    }

    function updateTopBarLikeButton() {
        if (currentTrack && likedSongs.has(currentTrack.id)) {
            likeBtnTopBar.innerHTML = `<i class="icon-like-filled"></i>`;
        } else {
            likeBtnTopBar.innerHTML = `<i class="icon-like"></i>`;
        }
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
        shuffleBtn.innerHTML = `<i class="icon-shuffle ${isShuffle ? 'active' : ''}"></i>`;
    }


    function cycleRepeat() {
        repeatBtn.classList.remove('active');
        if (repeatMode === 'none') {
            repeatMode = 'tracklist';
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = `<i class="icon-repeat"></i>`;
        } else if (repeatMode === 'tracklist') {
            repeatMode = 'one';
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = `<i class="icon-repeat_one"></i>`;
        } else {
            repeatMode = 'none';
            repeatBtn.classList.remove('active');
            repeatBtn.innerHTML = `<i class="icon-repeat"></i>`;

        }
    }







    function onTrackEnd() {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        } else {
            playNextTrack();
        }
    }

    function toggleMute() {
        audio.muted = !audio.muted;
        muteBtn.innerHTML = `<i class="icon-${audio.muted ? 'volume_up' : 'mute'}"></i>`;
    }

    function seek(e) {
        if (!audio.duration) return;
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
        volume = Math.max(0, Math.min(1, volume));
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
        localStorage.setItem('likedSongs', JSON.stringify(Array.from(likedSongs)));
    }

    function loadPlaylists() {
        const storedPlaylists = localStorage.getItem('playlists');
        if (storedPlaylists) {
            playlists = JSON.parse(storedPlaylists);
        }
    }

    function savePlaylists() {
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }

    function handleCreatePlaylistSubmit() {
        const nameInput = document.getElementById('new-playlist-name');
        const descriptionInput = document.getElementById('new-playlist-description');
        const coverInput = document.getElementById('new-playlist-cover');

        const name = nameInput.value.trim();
        if (!name) {
            alert("Playlist name is required.");
            return;
        }

        const editingId = createPlaylistModal.dataset.editingPlaylistId;

        if (editingId) {
            const playlist = playlists[editingId];
            playlist.name = name;
            playlist.description = descriptionInput.value.trim();
            playlist.customCoverUrl = coverInput.value.trim();
        } else {
            const id = `playlist_${Date.now()}`;
            playlists[id] = { id, name, description: descriptionInput.value.trim(), customCoverUrl: coverInput.value.trim(), trackIds: [] };
        }

        savePlaylists();
        navigateTo(location.hash.substring(1) || 'home');
        closeCreatePlaylistModal();
    }
    function createPlaylist() { openCreatePlaylistModal(); }

    function addTrackToPlaylist(trackId, playlistId) {
        const playlist = playlists[playlistId];
        if (playlist && !playlist.trackIds.includes(trackId)) {
            playlist.trackIds.push(trackId);
            savePlaylists();
            showToast(`Added to ${playlist.name}`);
        }
    }

    function updatePlaylistOrder(playlistId, grid) {
        const playlist = playlists[playlistId];
        if (playlist) {
            const newTrackIds = [...grid.querySelectorAll('.track-card')].map(card => card.dataset.trackId);
            playlist.trackIds = newTrackIds;
            savePlaylists();
        }
    }

    function removeTrackFromPlaylist(trackId, playlistId) {
        const playlist = playlists[playlistId];
        if (playlist) {
            const trackIndex = playlist.trackIds.indexOf(trackId);
            if (trackIndex > -1) {
                playlist.trackIds.splice(trackIndex, 1);
                savePlaylists();
                renderPlaylistDetailPage(playlistId);
            }
        }
    }

    function openAddToPlaylistModal(trackId) {
        const modalList = addToPlaylistModal.querySelector('#playlist-modal-list');
        modalList.innerHTML = Object.values(playlists).map(p =>
            `<li data-playlist-id="${p.id}">${p.name}</li>`
        ).join('');

        modalList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                addTrackToPlaylist(trackId, item.dataset.playlistId);
                closeAddToPlaylistModal();
            });
        });

        addToPlaylistModal.dataset.trackId = trackId;
        addToPlaylistModal.classList.remove('hidden');
    }

    function closeAddToPlaylistModal() {
        addToPlaylistModal.classList.add('hidden');
    }

    function openEditPlaylistModal(playlistId) {
        const playlist = playlists[playlistId];
        if (!playlist) return;

        createPlaylistModal.querySelector('h3').textContent = 'Edit details';
        createPlaylistSubmitBtn.textContent = 'Save';
        document.getElementById('new-playlist-name').value = playlist.name;
        document.getElementById('new-playlist-description').value = playlist.description || '';
        document.getElementById('new-playlist-cover').value = playlist.customCoverUrl ? playlist.customCoverUrl : '';
        createPlaylistModal.dataset.editingPlaylistId = playlistId;
        createPlaylistModal.classList.remove('hidden');
        document.getElementById('new-playlist-name').focus();
    }

    function openCreatePlaylistModal(forEditing = false) {
        if (!forEditing) {
            createPlaylistModal.querySelector('h3').textContent = 'Create Playlist';
            createPlaylistSubmitBtn.textContent = 'Create';
            delete createPlaylistModal.dataset.editingPlaylistId;
        }

        document.getElementById('new-playlist-name').value = '';
        document.getElementById('new-playlist-description').value = '';
        document.getElementById('new-playlist-cover').value = '';

        createPlaylistModal.classList.remove('hidden');
        document.getElementById('new-playlist-name').focus();

    }

    function closeCreatePlaylistModal() {
        createPlaylistModal.classList.add('hidden');
    }



    function createPlaylistFromModal() {
        const name = prompt("Enter playlist name:");
        if (name) {
            const id = `playlist_${Date.now()}`;
            playlists[id] = { id, name, trackIds: [] };
            savePlaylists();
            const trackId = addToPlaylistModal.dataset.trackId;
            addTrackToPlaylist(trackId, id);
            closeAddToPlaylistModal();
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.track-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function getRecentlyPlayed() {
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) return [];
        return JSON.parse(localStorage.getItem(`recentlyPlayed_${userId}`) || '[]');
    }

    function addToRecentlyPlayed(track) {
        const userId = localStorage.getItem('loggedInUserId');
        if (!userId) return;

        const key = `recentlyPlayed_${userId}`;
        let recentlyPlayed = getRecentlyPlayed();

        recentlyPlayed = recentlyPlayed.filter(t => t.id !== track.id);

        recentlyPlayed.unshift(track);
        recentlyPlayed.splice(50);

        localStorage.setItem(key, JSON.stringify(recentlyPlayed));
    }
    function goBack() {
        if (historyStack.length > 0) {
            const currentPage = location.hash.substring(1) || 'home';
            forwardStack.push(currentPage);
            const prevPage = historyStack.pop();
            navigateTo(prevPage, true);
        }
    }

    function goForward() {
        if (forwardStack.length > 0) {
            const currentPage = location.hash.substring(1) || 'home';
            historyStack.push(currentPage);
            const nextPage = forwardStack.pop();
            navigateTo(nextPage, true);
        }
    }

    function updateNavButtons() {
        backBtn.disabled = historyStack.length === 0;
        forwardBtn.disabled = forwardStack.length === 0;
    }


    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Toast container not found!');
            return;
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, { once: true });
        }, 3000);
    }

    function showPromptModal(title, placeholder, initialValue = '') {
        return new Promise((resolve, reject) => {
            promptModalTitle.textContent = title;
            promptModalInput.placeholder = placeholder;
            promptModalInput.value = initialValue;
            promptModal.classList.remove('hidden');
            promptModalInput.focus();
            promptModalInput.select();

            const submitHandler = () => {
                cleanup();
                resolve(promptModalInput.value.trim());
            };

            const cancelHandler = () => {
                cleanup();
                resolve(null);
            };

            const cleanup = () => {
                promptModal.classList.add('hidden');
                promptModalSubmitBtn.removeEventListener('click', submitHandler);
                promptModalCancelBtn.removeEventListener('click', cancelHandler);
            };

            promptModalSubmitBtn.addEventListener('click', submitHandler);
            promptModalCancelBtn.addEventListener('click', cancelHandler);
        });
    }

    function showConfirmModal(title, text) {
        return new Promise((resolve) => {
            confirmModalTitle.textContent = title;
            confirmModalText.textContent = text;
            confirmModal.classList.remove('hidden');
            confirmModal.querySelector('#confirm-modal-submit-btn').onclick = () => { confirmModal.classList.add('hidden'); resolve(true); };
            confirmModal.querySelector('#confirm-modal-cancel-btn').onclick = () => { confirmModal.classList.add('hidden'); resolve(false); };
        });
    }

    async function loadInitialTracks() {
        try {
            const response = await fetchWithRetry(`${API_URL}/api/music/search?q=top%20hits`);
            tracks = response.tracks;
        } catch (error) {
            console.error("Failed to load initial tracks", error);
        }
    }

    async function search(query) {
        if (searchTimeoutId) {
            clearTimeout(searchTimeoutId);
        }

        console.log("Debounced search for:", query);

        if (query.length < 2) {
            lastSearchResults = {};
            renderSearchResults(lastSearchResults);
            return;
        }

        try {
            const response = await new Promise(resolve => {
                searchTimeoutId = setTimeout(() => fetchWithRetry(`${API_URL}/api/music/search?q=${query}`).then(resolve), 300);
            });
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


    navigateTo('home');
    loadPlaylists();
});
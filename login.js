document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded fired in login.js');

        const meowtifyTitle = document.getElementById('meowtify-title');
        const authButtons = document.getElementById('auth-buttons');
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const loginUsernameInput = document.getElementById('login-username');
        const loginSubmitBtn = document.getElementById('login-submit');
        const loginBackBtn = document.getElementById('login-back');
        const loginMessage = document.getElementById('login-message');
        const signupUsernameInput = document.getElementById('signup-username');
        const signupSubmitBtn = document.getElementById('signup-submit');
        const signupBackBtn = document.getElementById('signup-back');
        const signupMessage = document.getElementById('signup-message');

        // Check if all necessary elements are found (excluding listening history elements)
        if (!meowtifyTitle || !authButtons || !loginBtn || !signupBtn || !loginForm || !signupForm ||
            !loginUsernameInput || !loginSubmitBtn || !loginBackBtn || !loginMessage ||
            !signupUsernameInput || !signupSubmitBtn || !signupBackBtn || !signupMessage) {
            console.error('One or more required elements not found in login.html. Please check IDs.');
            document.body.innerHTML = '<p style="color: red; text-align: center;">Error: Page elements missing. Please contact support.</p>';
            return;
        }

        let currentUserId = null;

        // Fade-in animation for "Meowtify" title
        meowtifyTitle.addEventListener('animationend', () => {
            authButtons.classList.remove('hidden');
            console.log('Meowtify title animation ended, auth buttons shown.');
        });

        // SHA256 Hashing function (client-side)
        async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hexHash;
        }

        // Show login form
        loginBtn.addEventListener('click', () => {
            authButtons.classList.add('hidden');
            loginForm.classList.remove('hidden');
            loginMessage.textContent = '';
            loginUsernameInput.value = '';
            console.log('Login button clicked, login form shown.');
        });

        // Show signup form
        signupBtn.addEventListener('click', () => {
            authButtons.classList.add('hidden');
            signupForm.classList.remove('hidden');
            signupMessage.textContent = '';
            signupUsernameInput.value = '';
            console.log('Signup button clicked, signup form shown.');
        });

        // Back from login form
        loginBackBtn.addEventListener('click', () => {
            loginForm.classList.add('hidden');
            authButtons.classList.remove('hidden');
            console.log('Back from login form, auth buttons shown.');
        });

        // Back from signup form
        signupBackBtn.addEventListener('click', () => {
            signupForm.classList.add('hidden');
            authButtons.classList.remove('hidden');
            console.log('Back from signup form, auth buttons shown.');
        });

        // Login submission
        loginSubmitBtn.addEventListener('click', async () => {
            const username = loginUsernameInput.value.trim();
            if (!username) {
                loginMessage.textContent = 'Please enter a username.';
                return;
            }

            loginMessage.textContent = 'Logging in...';
            const username_hash = await sha256(username);
            console.log('Attempting login for hash:', username_hash);

            try {
                const response = await fetch('http://localhost:3000/login', { // Assuming bot runs on port 3000
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username_hash }),
                });

                const data = await response.json();
                if (data.success) {
                    loginMessage.textContent = `Login successful! User ID: ${data.userId}`;
                    currentUserId = data.userId;
                    localStorage.setItem('loggedInUserId', currentUserId); // Store user ID
                    console.log('Login successful, user ID stored:', currentUserId);
                    window.location.href = 'index.html'; // Redirect to the main app
                } else {
                    loginMessage.textContent = `Login failed: ${data.message}`;
                    console.warn('Login failed:', data.message);
                }
            } catch (error) {
                console.error('Login fetch error:', error);
                loginMessage.textContent = 'Error connecting to the server.';
            }
        });

        // Signup submission
        signupSubmitBtn.addEventListener('click', async () => {
            const username = signupUsernameInput.value.trim();
            if (!username) {
                signupMessage.textContent = 'Please enter a username.';
                return;
            }

            signupMessage.textContent = 'Signing up...';
            const username_hash = await sha256(username);
            console.log('Attempting signup for hash:', username_hash);

            try {
                const response = await fetch('http://localhost:3000/signup', { // Assuming bot runs on port 3000
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username_hash }),
                });

                const data = await response.json();
                if (data.success) {
                    signupMessage.textContent = `Sign up successful! User ID: ${data.userId}`;
                    currentUserId = data.userId;
                    localStorage.setItem('loggedInUserId', currentUserId); // Store user ID
                    console.log('Signup successful, user ID stored:', currentUserId);
                    window.location.href = 'index.html'; // Redirect to the main app
                } else {
                    signupMessage.textContent = `Sign up failed: ${data.message}`;
                    console.warn('Signup failed:', data.message);
                }
            } catch (error) {
                console.error('Signup fetch error:', error);
                signupMessage.textContent = 'Error connecting to the server.';
            }
        });

        // Check if user is already logged in (e.g., from a previous session)
        const storedUserId = localStorage.getItem('loggedInUserId');
        if (storedUserId) {
            currentUserId = storedUserId;
            console.log('Found stored user ID:', storedUserId);
            // Immediately redirect if already logged in
            window.location.href = 'index.html';
        } else {
            console.log('No stored user ID found. Showing auth buttons.');
            authButtons.classList.remove('hidden'); // Show auth buttons if no user is logged in
        }

    } catch (e) {
        console.error('An unexpected error occurred in login.js:', e);
        document.body.innerHTML = '<p style="color: red; text-align: center;">An unexpected error occurred. Please check the console.</p>';
    }
});
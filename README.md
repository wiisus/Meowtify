<p align="center">
  <img src="assets/logo.png" alt="Meowtify Logo" width="200" />
</p>

<h1 align="center">Meowtify Web Player</h1>
<h3 align="center">Your ultimate music streaming experience. 🎶</h3>

<p align="center">
  <a href="README.md" title="English">
    <img src="https://flagcdn.com/gb.svg" alt="🇬🇧" width="28" height="20" />
  </a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="README_nl.md" title="Dutch">
    <img src="https://flagcdn.com/nl.svg" alt="🇳🇱" width="28" height="20" />
  </a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="README_ar.md" title="Arabic">
    <img src="https://flagcdn.com/dz.svg" alt="🇩🇿" width="28" height="20" />
  </a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="README_ru.md" title="Russian">
    <img src="https://flagcdn.com/ru.svg" alt="🇷🇺" width="28" height="20" />
  </a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="README_lv.md" title="Latvian">
    <img src="https://flagcdn.com/lv.svg" alt="🇱🇻" width="28" height="20" />
  </a>
</p>

---

## 👋 Welcome to Meowtify!

Ever wanted a music player that's all yours? Meowtify is a cool, web-based music player that lets you stream and discover new tunes. Think of it as your personal corner of the music world, powered by the massive libraries of Spotify and Qobuz. We've built it to be super easy and fun to use, whether you're a tech wizard or just here for the music.

This project is a showcase of what you can build with some clever coding (Node.js on the backend, simple JavaScript on the frontend) to create a modern, full-featured web app.

## ✨ What's Inside? (Features)

*   **🎵 A Universe of Music:** With millions of songs from Qobuz and Spotify, if a song exists, you can probably play it here.
*   **🤖 Smart Recommendations:** Meowtify learns what you like and suggests new tracks you'll love. It's like having a personal DJ!
*   **🎤 Sing Along with Lyrics:** Real-time lyrics for your favorite songs. Karaoke night, anyone?
*   **🔒 Your Own Account:** Sign up and log in to keep your listening history and preferences safe.
*   **🎛️ You're in Control:** All the buttons you need: shuffle, repeat, volume, and more.
*   **🎨 Smooth & Snazzy Design:** A clean, modern look that's a treat for the eyes and a breeze to navigate.

## 🚀 Get It Running on Your Machine

Want to play around with Meowtify yourself? Here’s how to get it set up.

### What You'll Need

*   **Node.js:** The engine that powers our server. You can get it [here](https://nodejs.org/).
*   **npm:** The little helper that installs all the other tools we need (it comes with Node.js).

### Let's Get Cooking! (Installation)

1.  **Grab the Code:**
    First, you'll need to download the project files.
    ```sh
    git clone https://github.com/your-username/meowtify-web.git
    cd meowtify-web
    ```

2.  **Install the Goodies:**
    Next, we'll install all the project's dependencies.
    ```sh
    npm install
    ```

3.  **Tell Us Your Secrets (API Keys):**
    *   Find the file named `config.example.json` and rename it to `config.json`.
    *   Open `config.json` and paste in your secret keys from Spotify and Discord. This is how Meowtify talks to them.
    ```json
    {
      "BOT_TOKEN": "YOUR_DISCORD_BOT_TOKEN",
      "TARGET_SERVER_ID": "YOUR_DISCORD_SERVER_ID",
      "DATABASE_CHANNEL_ID": "YOUR_DISCORD_CHANNEL_ID",
      "apiKeys": {
        "spotify": "YOUR_SPOTIFY_API_KEY",
        "spotify_secret": "YOUR_SPOTIFY_CLIENT_SECRET"
      }
    }
    ```

### Let the Music Play! (Usage)

To bring Meowtify to life, just run this command:

```sh
npm start
```

This will start the server. Now, open your favorite web browser and go to `http://localhost:3000`. Welcome to Meowtify!

## 🛠️ The Magic Behind the Curtain (Built With)

*   **The Brains (Backend):**
    *   [Node.js](https://nodejs.org/)
    *   [Express.js](https://expressjs.com/)
    *   [Discord.js](https://discord.js.org/)
    *   [Axios](https://axios-http.com/)
*   **The Beauty (Frontend):**
    *   HTML5
    *   CSS3
    *   Vanilla JavaScript

## 🤝 Want to Help Out? (Contributing)

We love it when people want to get involved! If you have an idea to make Meowtify even better, here's how you can help:

1.  **Fork the Project:** Make your own copy of Meowtify.
2.  **Create Your Branch:** Make a new branch for your cool new feature (`git checkout -b feature/SuperCoolFeature`).
3.  **Make Your Changes:** Work your magic and commit your changes (`git commit -m 'Add some SuperCoolFeature'`).
4.  **Push Your Branch:** Send your changes up to your fork (`git push origin feature/SuperCoolFeature`).
5.  **Open a Pull Request:** Ask us to pull your changes into the main project.

## 📄 The Fine Print (License)

Meowtify is released under the MIT License. You can find out more in the `LICENSE` file.

## 📧 Got Questions? (Contact)

Wiisus - @ssh.3bdou on discord



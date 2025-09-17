<p align="center">
  <img src="assets/logo.png" alt="Meowtify Logo" width="200" />
</p>

<h1 align="center">Meowtify Web Player</h1>
<h3 align="center">Uw ultieme muziekstreamingervaring. 🎶</h3>

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

## 👋 Welkom bij Meowtify!

Ooit een muziekspeler gewild die helemaal van u is? Meowtify is een coole, web-gebaseerde muziekspeler waarmee u nieuwe nummers kunt streamen en ontdekken. Zie het als uw persoonlijke hoekje van de muziekwereld, aangedreven door de enorme bibliotheken van Spotify en Qobuz. We hebben het zo gebouwd dat het supergemakkelijk en leuk is om te gebruiken, of u nu een tech-wizard bent of gewoon voor de muziek komt.

Dit project is een showcase van wat u kunt bouwen met wat slimme codering (Node.js aan de backend, eenvoudige JavaScript aan de frontend) om een moderne, volledig uitgeruste web-app te creëren.

## ✨ Wat zit erin? (Kenmerken)

*   **🎵 Een universum van muziek:** Met miljoenen nummers van Qobuz en Spotify, als een nummer bestaat, kunt u het hier waarschijnlijk afspelen.
*   **🤖 Slimme aanbevelingen:** Meowtify leert wat u leuk vindt en stelt nieuwe nummers voor waar u dol op zult zijn. Het is alsof u een persoonlijke DJ heeft!
*   **🎤 Zing mee met songteksten:** Real-time songteksten voor uw favoriete nummers. Karaoke-avond, iemand?
*   **🔒 Uw eigen account:** Meld u aan en log in om uw luistergeschiedenis en voorkeuren veilig te houden.
*   **🎛️ U heeft de controle:** Alle knoppen die u nodig heeft: shuffle, herhalen, volume en meer.
*   **🎨 Strak en blits ontwerp:** Een strak, modern uiterlijk dat een lust voor het oog is en een fluitje van een cent om te navigeren.

## 🚀 Aan de slag op uw machine

Wilt u zelf met Meowtify spelen? Hier leest u hoe u het kunt instellen.

### Wat u nodig heeft

*   **Node.js:** De motor die onze server aandrijft. U kunt het [hier](https://nodejs.org/) krijgen.
*   **npm:** De kleine helper die alle andere tools installeert die we nodig hebben (het wordt geleverd met Node.js).

### Laten we aan de slag gaan! (Installatie)

1.  **Pak de code:**
    Eerst moet u de projectbestanden downloaden.
    ```sh
    git clone https://github.com/uw-gebruikersnaam/meowtify-web.git
    cd meowtify-web
    ```

2.  **Installeer de goodies:**
    Vervolgens installeren we alle afhankelijkheden van het project.
    ```sh
    npm install
    ```

3.  **Vertel ons uw geheimen (API-sleutels):**
    *   Zoek het bestand met de naam `config.example.json` en hernoem het naar `config.json`.
    *   Open `config.json` en plak uw geheime sleutels van Spotify en Discord erin. Zo praat Meowtify met hen.
    ```json
    {
      "BOT_TOKEN": "UW_DISCORD_BOT_TOKEN",
      "TARGET_SERVER_ID": "UW_DISCORD_SERVER_ID",
      "DATABASE_CHANNEL_ID": "UW_DISCORD_KANAAL_ID",
      "apiKeys": {
        "spotify": "UW_SPOTIFY_API_SLEUTEL",
        "spotify_secret": "UW_SPOTIFY_CLIENT_GEHEIM"
      }
    }
    ```

### Laat de muziek spelen! (Gebruik)

Om Meowtify tot leven te brengen, voert u gewoon dit commando uit:

```sh
npm start
```

Dit start de server. Open nu uw favoriete webbrowser en ga naar `http://localhost:3000`. Welkom bij Meowtify!

## 🛠️ De magie achter de schermen (gebouwd met)

*   **De hersenen (backend):**
    *   [Node.js](https://nodejs.org/)
    *   [Express.js](https://expressjs.com/)
    *   [Discord.js](https://discord.js.org/)
    *   [Axios](https://axios-http.com/)
*   **De schoonheid (frontend):**
    *   HTML5
    *   CSS3
    *   Vanilla JavaScript

## 🤝 Wilt u helpen? (Bijdragen)

We vinden het geweldig als mensen willen meedoen! Als u een idee heeft om Meowtify nog beter te maken, kunt u hier helpen:

1.  **Fork het project:** Maak uw eigen kopie van Meowtify.
2.  **Maak uw branch:** Maak een nieuwe branch voor uw coole nieuwe functie (`git checkout -b feature/SuperCoolFeature`).
3.  **Commit uw wijzigingen:** Werk uw magie en commit uw wijzigingen (`git commit -m 'Voeg een SuperCoolFeature toe'`).
4.  **Push uw branch:** Stuur uw wijzigingen naar uw fork (`git push origin feature/SuperCoolFeature`).
5.  **Open een pull-request:** Vraag ons om uw wijzigingen in het hoofdproject te trekken.

## 📄 De kleine lettertjes (licentie)

Meowtify wordt uitgebracht onder de MIT-licentie. U kunt meer informatie vinden in het `LICENSE`-bestand.

## 📧 Heeft u vragen? (Contact)

Wiisus - @ssh.3bdou on discord



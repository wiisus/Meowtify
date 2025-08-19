<p align="center">
  <img src="assets/logo.png" alt="Meowtify Logo" width="200" />
</p>

<h1 align="center">Meowtify Web Player</h1>
<h3 align="center">Jūsu galvenā mūzikas straumēšanas pieredze. 🎶</h3>

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

## 👋 Laipni lūdzam Meowtify!

Vai esat kādreiz vēlējies mūzikas atskaņotāju, kas ir pilnībā jūsu? Meowtify ir foršs, tīmekļa mūzikas atskaņotājs, kas ļauj straumēt un atklāt jaunas melodijas. Iedomājieties to kā savu personīgo mūzikas pasaules stūrīti, ko darbina milzīgās Spotify un Qobuz bibliotēkas. Mēs esam to izveidojuši tā, lai to būtu ļoti viegli un jautri lietot neatkarīgi no tā, vai esat tehnoloģiju burvis vai vienkārši šeit mūzikas dēļ.

Šis projekts ir paraugs tam, ko var izveidot ar gudru kodēšanu (Node.js aizmugurē, vienkāršs JavaScript priekšpusē), lai izveidotu modernu, pilnvērtīgu tīmekļa lietotni.

## ✨ Kas ir iekšā? (Funkcijas)

*   **🎵 Mūzikas Visums:** Ar miljoniem dziesmu no Qobuz un Spotify, ja dziesma pastāv, jūs, iespējams, varat to šeit atskaņot.
*   **🤖 Gudri ieteikumi:** Meowtify mācās, kas jums patīk, un iesaka jaunus ierakstus, kas jums patiks. Tas ir kā personīgais dīdžejs!
*   **🎤 Dziediet līdzi ar dziesmu tekstiem:** Reāllaika dziesmu teksti jūsu iecienītākajām dziesmām. Karaoke vakars, kāds?
*   **🔒 Jūsu pašu konts:** Reģistrējieties un piesakieties, lai saglabātu savu klausīšanās vēsturi un preferences.
*   **🎛️ Jūs kontrolējat:** Visas nepieciešamās pogas: jaukšana, atkārtošana, skaļums un citas.
*   **🎨 Gluds un stilīgs dizains:** Tīrs, moderns izskats, kas ir baudījums acīm un viegli navigējams.

## 🚀 Palaidiet to savā datorā

Vai vēlaties pats paspēlēties ar Meowtify? Lūk, kā to iestatīt.

### Kas jums būs nepieciešams

*   **Node.js:** Dzinējs, kas darbina mūsu serveri. Jūs to varat iegūt [šeit](https://nodejs.org/).
*   **npm:** Mazais palīgs, kas instalē visus pārējos nepieciešamos rīkus (tas nāk kopā ar Node.js).

### Sāksim gatavot! (Instalēšana)

1.  **Paņemiet kodu:**
    Vispirms jums būs jālejupielādē projekta faili.
    ```sh
    git clone https://github.com/jūsu-lietotājvārds/meowtify-web.git
    cd meowtify-web
    ```

2.  **Instalējiet labumus:**
    Tālāk mēs instalēsim visas projekta atkarības.
    ```sh
    npm install
    ```

3.  **Pastāstiet mums savus noslēpumus (API atslēgas):**
    *   Atrodiet failu ar nosaukumu `config.example.json` un pārdēvējiet to par `config.json`.
    *   Atveriet `config.json` un ielīmējiet savas slepenās atslēgas no Spotify un Discord. Tā Meowtify sazinās ar viņiem.
    ```json
    {
      "BOT_TOKEN": "JŪSU_DISCORD_BOT_TOKEN",
      "TARGET_SERVER_ID": "JŪSU_DISCORD_SERVERA_ID",
      "DATABASE_CHANNEL_ID": "JŪSU_DISCORD_KANĀLA_ID",
      "apiKeys": {
        "spotify": "JŪSU_SPOTIFY_API_ATSLĒGA",
        "spotify_secret": "JŪSU_SPOTIFY_KLIENTA_NOSLĒPUMS"
      }
    }
    ```

### Lai mūzika skan! (Lietošana)

Lai atdzīvinātu Meowtify, vienkārši palaidiet šo komandu:

```sh
npm start
```

Tas palaidīs serveri. Tagad atveriet savu iecienītāko tīmekļa pārlūkprogrammu un dodieties uz `http://localhost:3000`. Laipni lūdzam Meowtify!

## 🛠️ Maģija aiz priekškara (izveidots ar)

*   **Smadzenes (aizmugure):**
    *   [Node.js](https://nodejs.org/)
    *   [Express.js](https://expressjs.com/)
    *   [Discord.js](https://discord.js.org/)
    *   [Axios](https://axios-http.com/)
*   **Skaistums (priekšgals):**
    *   HTML5
    *   CSS3
    *   Tīrs JavaScript

## 🤝 Vēlaties palīdzēt? (Ieguldījums)

Mums patīk, ja cilvēki vēlas iesaistīties! Ja jums ir ideja, kā padarīt Meowtify vēl labāku, lūk, kā jūs varat palīdzēt:

1.  **Dakšojiet projektu:** Izveidojiet savu Meowtify kopiju.
2.  **Izveidojiet savu zaru:** Izveidojiet jaunu zaru savai foršajai jaunajai funkcijai (`git checkout -b feature/SuperCoolFeature`).
3.  **Apstipriniet savas izmaiņas:** Pielietojiet savu maģiju un apstipriniet savas izmaiņas (`git commit -m 'Pievienot kādu SuperCoolFeature'`).
4.  **Iesniedziet savu zaru:** Nosūtiet savas izmaiņas uz savu dakšu (`git push origin feature/SuperCoolFeature`).
5.  **Atveriet vilkšanas pieprasījumu:** Lūdziet mums ievilkt jūsu izmaiņas galvenajā projektā.

## 📄 Sīkā druka (licence)

Meowtify tiek izlaists saskaņā ar MIT licenci. Vairāk informācijas varat atrast `LICENSE` failā.

## 📧 Vai ir jautājumi? (Kontakti)

Wiisus - @ssh.3bdou on discord



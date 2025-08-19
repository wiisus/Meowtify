<p align="center">
  <img src="assets/logo.png" alt="Meowtify Logo" width="200" />
</p>

<h1 align="center">Meowtify Web Player</h1>
<h3 align="center">تجربة بث الموسيقى المثالية. 🎶</h3>

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

## 👋 أهلاً بك في Meowtify!

هل أردت يومًا مشغل موسيقى خاص بك بالكامل؟ Meowtify هو مشغل موسيقى رائع على شبكة الإنترنت يتيح لك بث واكتشاف نغمات جديدة. فكر فيه كركنك الشخصي في عالم الموسيقى، مدعومًا بالمكتبات الضخمة لـ Spotify و Qobuz. لقد قمنا ببنائه ليكون سهلًا وممتعًا للغاية في الاستخدام، سواء كنت ساحرًا تقنيًا أو هنا فقط من أجل الموسيقى.

هذا المشروع هو عرض لما يمكنك بناؤه ببعض الترميز الذكي (Node.js في الواجهة الخلفية، وجافا سكريبت بسيط في الواجهة الأمامية) لإنشاء تطبيق ويب حديث كامل الميزات.

## ✨ ماذا يوجد بالداخل؟ (الميزات)

*   **🎵 عالم من الموسيقى:** مع الملايين من الأغاني من Qobuz و Spotify، إذا كانت الأغنية موجودة، فمن المحتمل أن تتمكن من تشغيلها هنا.
*   **🤖 توصيات ذكية:** يتعلم Meowtify ما يعجبك ويقترح مسارات جديدة ستحبها. إنه مثل وجود دي جي شخصي!
*   **🎤 الغناء مع كلمات الأغاني:** كلمات الأغاني في الوقت الفعلي لأغانيك المفضلة. ليلة كاريوكي، أي شخص؟
*   **🔒 حسابك الخاص:** قم بالتسجيل وتسجيل الدخول للحفاظ على سجل الاستماع والتفضيلات الخاصة بك آمنة.
*   **🎛️ أنت المتحكم:** جميع الأزرار التي تحتاجها: التبديل العشوائي، التكرار، مستوى الصوت، والمزيد.
*   **🎨 تصميم سلس وأنيق:** مظهر نظيف وحديث يريح العين وسهل التنقل.

## 🚀 قم بتشغيله على جهازك

هل تريد اللعب بـ Meowtify بنفسك؟ إليك كيفية إعداده.

### ما ستحتاجه

*   **Node.js:** المحرك الذي يشغل خادمنا. يمكنك الحصول عليه [هنا](https://nodejs.org/).
*   **npm:** المساعد الصغير الذي يقوم بتثبيت جميع الأدوات الأخرى التي نحتاجها (يأتي مع Node.js).

### لنبدأ الطهي! (التثبيت)

1.  **احصل على الكود:**
    أولاً، ستحتاج إلى تنزيل ملفات المشروع.
    ```sh
    git clone https://github.com/your-username/meowtify-web.git
    cd meowtify-web
    ```

2.  **تثبيت الأشياء الجيدة:**
    بعد ذلك، سنقوم بتثبيت جميع تبعيات المشروع.
    ```sh
    npm install
    ```

3.  **أخبرنا بأسرارك (مفاتيح API):**
    *   ابحث عن الملف المسمى `config.example.json` وأعد تسميته إلى `config.json`.
    *   افتح `config.json` والصق مفاتيحك السرية من Spotify و Discord. هذه هي الطريقة التي يتحدث بها Meowtify معهم.
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

### دع الموسيقى تعزف! (الاستخدام)

لإحياء Meowtify، ما عليك سوى تشغيل هذا الأمر:

```sh
npm start
```

سيؤدي هذا إلى بدء تشغيل الخادم. الآن، افتح متصفح الويب المفضل لديك وانتقل إلى `http://localhost:3000`. مرحبًا بك في Meowtify!

## 🛠️ السحر وراء الستار (بني باستخدام)

*   **العقول (الواجهة الخلفية):**
    *   [Node.js](https://nodejs.org/)
    *   [Express.js](https://expressjs.com/)
    *   [Discord.js](https://discord.js.org/)
    *   [Axios](https://axios-http.com/)
*   **الجمال (الواجهة الأمامية):**
    *   HTML5
    *   CSS3
    *   Vanilla JavaScript

## 🤝 هل تريد المساعدة؟ (المساهمة)

نحن نحب أن يشارك الناس! إذا كان لديك فكرة لجعل Meowtify أفضل، فإليك كيف يمكنك المساعدة:

1.  **تفرع المشروع:** قم بإنشاء نسختك الخاصة من Meowtify.
2.  **أنشئ فرعك:** قم بإنشاء فرع جديد لميزتك الرائعة الجديدة (`git checkout -b feature/SuperCoolFeature`).
3.  **قم بتثبيت تغييراتك:** اعمل سحرك وقم بتثبيت تغييراتك (`git commit -m 'Add some SuperCoolFeature'`).
4.  **ادفع فرعك:** أرسل تغييراتك إلى تفرعك (`git push origin feature/SuperCoolFeature`).
5.  **افتح طلب سحب:** اطلب منا سحب تغييراتك إلى المشروع الرئيسي.

## 📄 التفاصيل الدقيقة (الترخيص)

يتم إصدار Meowtify بموجب ترخيص MIT. يمكنك معرفة المزيد في ملف `LICENSE`.

## 📧 هل لديك أسئلة؟ (الاتصال)

Wiisus - @ssh.3bdou on discord

رابط المشروع: [https://github.com/your-username/meowtify-web](https://github.com/your-username/meowtify-web)
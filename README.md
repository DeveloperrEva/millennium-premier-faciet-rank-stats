# **FaceIt Stats for [Millennium](https://steambrew.app)**  
# **FaceIt Stats для [Millennium](https://steambrew.app)**

### 🏆 Integrate a **[FaceIt](https://faceit.com)** widget with **CS2 stats and Premier rating (current / best)** into Steam profile pages — works in overlay browser too!  
### 🏆 Интеграция виджета **[FaceIt](https://faceit.com)** со статистикой **CS2 и рейтинг Premier (текущий / максимальный)** на страницах профиля Steam — работает и в оверлей-браузере!

![image](https://github.com/DeveloperrEva/millennium-premier-faciet-rank-stats/blob/main/main.jpg?raw=true)  

---

## ⚡ About | О плагине

#### English (EN)
- 🔹 Displays **basic Steam and FaceIt stats** (Matches, Elo, K/D ratio).
- 🔹 Shows **Premier rating** (current / best) fetched from CSStats.gg.
- 🔹 **CS2 start date** is determined using the “A New Beginning” achievement; on profiles with many achievements this may be slow.
- 💡 **Left-click** the stats block to toggle H/S, ADR, and WinRate.

#### Russian (RU)
- 🔹 Отображает **основные статистики Steam и FaceIt** (матчи, Elo, K/D).
- 🔹 Показывает **рейтинг Premier** (текущий / максимальный), полученный с CSStats.gg.
- 🔹 **Дата начала CS2** определяется через достижение «A New Beginning»; на профилях с большим количеством достижений может загружаться медленнее.
- 💡 **Левый клик** по блоку статистики переключает H/S, ADR и WinRate.


---

## 📥 Installation | Установка

#### English (EN)
> 🚫 Avoid GitHub builds—they may be outdated and unreviewed by Millennium devs.
> ✅ **Preferred:** Install directly from [Steambrew](https://steambrew.app/plugin?id=57c553750f61).

1. Download the latest release from the Steambrew plugin page.
2. Copy the `alowave.faceit_premier_stats` folder into your Steam plugins directory:
   - **Default (Windows):** `C:\Program Files (x86)\Steam\plugins`
   - **Default (Unix):** `~/.millennium/plugins`
3. In addition, navigate to **`C:\Program Files (x86)\Steam\ext\data\assets`**, open (or create) the file `requirements.txt`, and add the following lines:
bs4
cloudscraper

4. Launch Steam and activate the plugin in **Millennium settings**.

#### Russian (RU)
> 🚫 Не используйте сборки из GitHub — они могут быть устаревшими и не проверенными разработчиками Millennium.
> ✅ **Рекомендуется:** скачивать напрямую с [Steambrew](https://steambrew.app/plugin?id=57c553750f61).

1. Скачайте последний релиз на странице плагина.
2. Скопируйте папку `alowave.faceit_premier_stats` в каталог плагинов Steam:
- **По умолчанию (Windows):** `C:\Program Files (x86)\Steam\plugins`
- **По умолчанию (Unix):** `~/.millennium/plugins`
3. Затем перейдите в **`C:\Program Files (x86)\Steam\ext\data\assets`**, откройте файл `requirements.txt` и добавьте:
bs4
cloudscraper

4. Запустите Steam и включите плагин в настройках Millennium.

---

## 🛠️ Building | Сборка

git clone https://github.com/DeveloperrEva/millennium-premier-faciet-rank-stats
cd millennium-premier-faciet-rank-stats
pnpm install
pnpm run build
millennium plugins enable faceit_premier_stats

---

## 📌 Notes | Примечания

#### English (EN)

⚠️ This plugin uses WebKit to inject JavaScript into your Steam browser. Please review the code before installing from untrusted sources.  
🔸 **Based on:** [alowave/millennium-faceit-stats](https://github.com/alowave/millennium-faceit-stats) (this plugin is a fork with modifications).

#### Russian (RU)

⚠️ Этот плагин использует WebKit для внедрения JavaScript в браузер Steam. Пожалуйста, перед установкой из непроверенных источников ознакомьтесь с кодом.  
🔸 **Основано на:** [alowave/millennium-faceit-stats](https://github.com/alowave/millennium-faceit-stats) (это форк с внесёнными изменениями).

---

### **MILLENNIUM_PATH:**
-   **Windows:** `C:\Program Files (x86)\Steam`
-   **Unix:** `~/.millennium`
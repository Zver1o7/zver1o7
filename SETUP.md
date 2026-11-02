# 🦊 Профиль Zver1o7 — всё лежит в одной папке

## Что внутри

```
github-profile/
├── README.md                      ← сам профиль (заливается в корень репо)
├── SETUP.md                       ← эта инструкция (в репо можно не заливать)
├── assets/
│   ├── header.svg                 ← аркадный HUD-баннер: лис-дев за ноутбуком (очки/наушники/код), CRT-эффекты
│   ├── fox-run.svg                ← мини-игра: лис прыгает через ящики за зайцем
│   ├── terminal.svg               ← живой терминал: печатает команды, прогресс-бар, курсор
│   ├── divider.svg                ← анимированные неоновые разделители секций
│   └── generated/
│       ├── stats.svg              ← стартовая карточка статистики (обновляет Actions)
│       └── langs.svg              ← стартовые языки (обновляет Actions)
├── .github/workflows/
│   └── stats.yml                  ← генератор карточек: коммитит обновления сам
└── scripts/
    └── gen-stats.js               ← скрипт: дёргает GitHub API и рисует stats.svg + langs.svg
```

## Установка за 3 шага

### Шаг 1 — создай репозиторий

- Заходи: https://github.com/new
- Имя: ровно **`Zver1o7`** (как ник)
- Видимость: **Public** ✅ (иначе профиль не покажет README)
- Галочку «Add a README» **не ставь** — он уже готов

### Шаг 2 — залей содержимое папки

> ⚠️ Главное: заливай **содержимое** папки, а не саму папку.
> Если перетащить папку целиком — всё упадёт в `github-profile/…` и профиль не увидит файлы.

**Через сайт (проще всего):**
1. В репозитории: **Add file → Upload files**
2. Открой `D:\123\github-profile`, выдели всё внутри (**Ctrl+A**) и перетащи в окно загрузки
3. **Commit changes**

**Или через git:**

```bash
cd D:\123\github-profile
git init
git add .
git commit -m "🔥 ember fox profile"
git branch -M main
git remote add origin https://github.com/Zver1o7/Zver1o7.git
git push -u origin main
```

Открой https://github.com/Zver1o7 — баннер с лисом уже на месте 🦊

### Шаг 3 — включи воркфлоу статистики (1 минута)

1. В репозитории открой вкладку **Actions** → нажми **Enable workflows**
2. Стартовые карточки уже в репо (`assets/generated/`) — профиль работает сразу, без ожиданий
3. Слева выбери **Generate Stats** → **Run workflow** → ветка `main` → **Run**
   → воркфлоу сам перегенерит карточки под твой аккаунт и закоммитит их в `assets/generated/`
4. Обнови профиль (**Ctrl+F5**) — всё анимируется

Дальше всё крутится само: карточки обновляются раз в день, а баннер, терминал и лисогонка живут прямо в репозитории и не ломаются никогда.

## Кастомизация

| Что меняем | Где |
|---|---|
| Текст баннера | `assets/header.svg` → теги `<text>` |
| Строки терминала | `assets/terminal.svg` → теги `<text>` |
| Лисогонка | `assets/fox-run.svg` — подписи в тегах `<text>` |
| Оранжевый акцент | код `FF7A18` / `FF9E2C` в SVG и бейджах |
| Услуги | секция `🔥 Услуги` в `README.md` |
| Скиллы | таблица `⚡ Tech Stack` в `README.md` |
| Контакты | секция `📡` в `README.md` |

## Опциональные фичи

- **Пины репозиториев**: на странице профиля → «Customize your pins» → выбери 2–6 лучших проектов. Внутри них тоже сделай README с картинками — эффект x2.
- **Трофеи / Activity Graph**: публичные инстансы сейчас лежат (402/503), поэтому в README они **закомментированы**. Захочешь — задеплой свой инстанс на Vercel (кнопка **Deploy** в README проектов [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy) и [readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)), подставь свой адрес и раскомментируй блок в секции `📊`.
- **WakaTime** (карточка времени за кодом): зарегайся на https://wakatime.com, поставь плагин IDE и добавь в README:

```html
### ⏱ WakaTime
<img src="https://github-readme-stats.vercel.app/api/wakatime?username=Zver1o7&hide_border=true&bg_color=0D1117&title_color=FF9E2C&text_color=E6EDF3&icon_color=FF7A18" />
```

## Если что-то не завелось

| Симптом | Лечение |
|---|---|
| Профиль не показывает README | Репо называется ровно `Zver1o7`, он **public**, `README.md` лежит в **корне** |
| Карточки статистики не обновляются | Вкладка **Actions** → **Generate Stats** должен быть зелёным; файлы лежат в `assets/generated/` |
| Карточка «отстаёт» по времени | Обновление идёт **каждый час** (GitHub иногда задерживает cron до ~30 мин) + при изменении `scripts/gen-stats.js`. Кэш картинок GitHub (camo) теперь сбрасывается автоматически — воркфлоу сам обновляет метку `?v=` в README |

---

Профиль уровня «пиздатый» собран. Лис одобряет 🦊🔥

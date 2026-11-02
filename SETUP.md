# 🦊 Профиль Zver1o7 — всё лежит в одной папке

## Что внутри

```
github-profile/
├── README.md                      ← сам профиль (заливается в корень репо)
├── SETUP.md                       ← эта инструкция (в репо можно не заливать)
├── assets/
│   ├── header.svg                 ← анимированный баннер: лоуполи-лис, неон, сетка, искры
│   ├── terminal.svg               ← живой терминал: печатает команды, прогресс-бар, курсор
│   └── divider.svg                ← анимированные неоновые разделители секций
├── .github/workflows/
│   ├── snake.yml                  ← змейка, которая жрёт контрибуции
│   └── stats.yml                  ← генератор карточек статистики
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

### Шаг 3 — включи два воркфлоу (один раз, 1 минута)

1. В репозитории открой вкладку **Actions** → нажми **Enable workflows**
2. Слева выбери **Generate Stats** → **Run workflow** → ветка `main` → **Run**
   → появится ветка `stats-output` с живыми карточками статистики
3. Слева выбери **Snake Animation** → **Run workflow**
   → появится ветка `snake-output` со змейкой
4. Обнови профиль (**Ctrl+F5**) — всё анимируется

Дальше всё крутится само: статистика — раз в день и на каждый пуш, змейка — каждые 6 часов.

## Кастомизация

| Что меняем | Где |
|---|---|
| Текст баннера | `assets/header.svg` → теги `<text>` |
| Строки терминала | `assets/terminal.svg` → теги `<text>` |
| Оранжевый акцент | код `FF7A18` / `FF9E2C` в SVG и бейджах |
| Список «Сейчас в работе» | секция `🚧` в `README.md` |
| Скиллы | таблица `⚡ Tech Stack` в `README.md` |
| Контакты | секция `📡` в `README.md` |

## Опциональные фичи

- **Пины репозиториев**: на странице профиля → «Customize your pins» → выбери 2–6 лучших проектов. Внутри них тоже сделай README с картинками — эффект x2.
- **Трофеи / Activity Graph**: публичные инстансы сейчас лежат (402/503), поэтому в README они **закомментированы**. Захочешь — задеплой свой инстанс на Vercel (кнопка **Deploy** в README проектов [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy) и [readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)), подставь свой адрес и раскомментируй блок в секции `📊`.
- **WakaTime** (карточка времени за кодом): зарегайся на https://wakatime.com, поставь плагин IDE и добавь в README:

```html
### ⏱ WakaTime
<img src="https://github-readme-stats.vercel.app/api/wakatime?username=ZVER1O7&hide_border=true&bg_color=0D1117&title_color=FF9E2C&text_color=E6EDF3&icon_color=FF7A18" />
```

## Если что-то не завелось

| Симптом | Лечение |
|---|---|
| Профиль не показывает README | Репо называется ровно `Zver1o7`, он **public**, `README.md` лежит в **корне** |
| Карточки статистики не грузятся | Actions → **Generate Stats** должен быть зелёным; проверь, что существует ветка `stats-output` |
| Змейки нет | Actions → **Snake Animation** → Run; проверь ветку `snake-output` |
| Змейка грустная и маленькая | Она растёт вместе с контрибуциями. Корми её коммитами 🐍🔥 |

---

Профиль уровня «пиздатый» собран. Лис одобряет 🦊🔥

# ⚽ Football Academy Payment Reminder Bot

A production-ready Telegram bot for managing football academy player registrations and automating monthly payment reminders. Built for coaches — the admin is the only user.

---

## Features

- ➕ Register new players with full profile (name, team, parent phone, fee, photo)
- 👥 View all registered players with photos and payment status
- 💰 Mark individual payments as received (auto-resets 30-day cycle)
- 📅 View all players with payments due or overdue today
- 🔔 Automatic daily reminder at 8:00 AM for due players
- 🔒 Admin-only access — unauthorized users are rejected

---

## Tech Stack

- **Node.js** (CommonJS)
- **node-telegram-bot-api** — Telegram Bot API wrapper
- **Supabase** — PostgreSQL database (via `@supabase/supabase-js`)
- **node-cron** — Daily scheduled reminders
- **uuid** — Unique player IDs
- **dotenv** — Environment variable management
- **nodemon** — Hot reload for development

---

## Installation

```bash
# 1. Clone or download the project
cd football-academy-bot

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env

# 4. Fill in your credentials (see Environment Variables below)
nano .env
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
BOT_TOKEN=your_telegram_bot_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
ADMIN_CHAT_ID=your_telegram_chat_id_here
```

| Variable          | Description                                          |
|-------------------|------------------------------------------------------|
| `BOT_TOKEN`       | From [@BotFather](https://t.me/BotFather) on Telegram |
| `SUPABASE_URL`    | Your Supabase project URL                            |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key                      |
| `ADMIN_CHAT_ID`   | Your personal Telegram chat ID (use [@userinfobot](https://t.me/userinfobot)) |

---

## Supabase Setup

### 1. Create the `players` table

In your Supabase project, run the following SQL:

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  team TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  monthly_fee INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  last_payment_date DATE NOT NULL,
  next_payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create the Storage bucket for player photos

In the Supabase dashboard:

1. Go to **Storage** → **New Bucket**
2. Name it exactly: `player-photos`
3. Set it to **Public** (so photos are viewable in the bot)

Or run this SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-photos', 'player-photos', true);
```

Then add a public read policy:

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'player-photos');

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player-photos');
```

---

## Running the Bot

### Production
```bash
npm start
```

### Development (with hot reload)
```bash
npm run dev
```

---

## Bot Commands & Navigation

All navigation is done through **inline keyboard buttons**. No manual command typing required.

| Button / Action     | Description                                                  |
|---------------------|--------------------------------------------------------------|
| `/start`            | Show welcome message and main menu                           |
| ➕ Add Player        | Step-by-step form to register a new player                   |
| 👥 Players           | List all players with photos, fees, and payment dates        |
| 💰 Paid             | Select a player and mark their payment as received           |
| 📅 Due Today         | List players whose payment is due or overdue                 |
| ❓ Help              | Show help text and command reference                         |
| ✅ Paid *(per card)* | Quickly mark a specific player as paid from the player card  |
| 👤 View *(per card)* | View full profile of a specific player                       |

---

## Payment Logic

- **Last Payment Date** — set to today when player is added or payment is marked
- **Next Payment Date** — always `Last Payment Date + 30 days`
- **Due Players** — any player where `next_payment_date <= today`

---

## Automatic Daily Reminder (Cron)

The bot runs a scheduled job every day at **8:00 AM East Africa Time (EAT)**.

- Queries Supabase for all players where `next_payment_date <= today`
- If any players are found, sends a single formatted message to `ADMIN_CHAT_ID`
- If no players are due, does nothing (no spam)

Timezone is set to `Africa/Addis_Ababa`. To change it, edit `scheduler/cron.js`.

---

## Folder Structure

```
football-academy-bot/
│
├── index.js                  # Entry point — bot init, event routing
├── package.json
├── .env.example
├── README.md
│
├── config/
│   ├── bot.js                # Telegram bot instance
│   └── supabase.js           # Supabase client
│
├── commands/
│   ├── start.js              # /start command
│   ├── help.js               # Help message
│   ├── addPlayer.js          # Multi-step player registration flow
│   ├── players.js            # List all players
│   ├── player.js             # View single player profile
│   ├── paid.js               # Mark payment / paid menu
│   └── due.js                # Due today view
│
├── services/
│   ├── playerService.js      # Player CRUD (Supabase)
│   ├── paymentService.js     # Payment update logic
│   └── reminderService.js    # Build & send daily reminder message
│
├── scheduler/
│   └── cron.js               # node-cron daily job
│
├── utils/
│   ├── keyboards.js          # Reusable inline keyboard builders
│   ├── validation.js         # Input validators
│   └── date.js               # Date helpers (today, +30 days, format)
│
├── middleware/
│   └── auth.js               # Admin-only access guard
│
└── constants/
    └── messages.js           # All bot message strings
```

---

## Security Notes

- Only the `ADMIN_CHAT_ID` can interact with the bot — all other users are rejected immediately.
- Never commit your `.env` file to version control.
- The Supabase anon key is safe for server-side use in this context.

---

## License

MIT

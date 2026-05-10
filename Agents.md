Build a full-stack web app called "Writing Progress Tracker".

Goal:
Create an app that helps me improve my English writing. I want to paste or type my writing, get scores from 1-100 using specific writing metrics, get a better corrected version, get sentence-by-sentence advice, and save both my original version and improved version in a Prisma-backed Postgres database so I can track my weekly and monthly improvement.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM with Postgres
- JWT auth using HTTP-only cookies
- OpenAI with OpenRouter fallback for analysis
- Recharts for analytics charts
- Clean, beginner-friendly code
- Responsive design for desktop and mobile

Authentication requirements:
- Use email/password signup and login.
- Hash passwords before saving them.
- Store users in a `users` table.
- Store session JWTs in HTTP-only cookies.
- Protect private pages and API routes with server-side user checks.
- Logout should clear the session cookie.

Environment variables:
- DATABASE_URL=
- JWT_SECRET=
- OPENAI_API_KEY=
- OPENAI_MODEL=gpt-5.2
- OPENROUTER_API_KEY=
- OPENROUTER_MODEL=openai/gpt-oss-120b:free
- OPENROUTER_SITE_URL=
- OPENROUTER_APP_NAME=Writing Progress Tracker

Main writing metrics:
1. Grammar
2. Vocabulary
3. Spelling
4. Punctuation
5. Organization
6. Clarity
7. Naturalness
8. Sentence variety

Main pages:
1. Dashboard page
2. New writing / analyze page
3. Result detail page
4. History page
5. Analytics page for weekly and monthly progress
6. Auth pages: login, signup, logout

Database requirements:

users:
- id uuid primary key default gen_random_uuid()
- email text unique not null
- password_hash text not null
- created_at timestamp with time zone default now()

writing_entries:
- id uuid primary key default gen_random_uuid()
- user_id uuid references users(id) on delete cascade not null
- title text not null
- original_text text not null
- improved_text text
- main_advice text[] default empty array
- word_count int
- overall_score int
- created_at timestamp with time zone default now()

writing_scores:
- id uuid primary key default gen_random_uuid()
- writing_entry_id uuid references writing_entries(id) on delete cascade
- grammar int
- vocabulary int
- spelling int
- punctuation int
- organization int
- clarity int
- naturalness int
- sentence_variety int
- created_at timestamp with time zone default now()

sentence_feedback:
- id uuid primary key default gen_random_uuid()
- writing_entry_id uuid references writing_entries(id) on delete cascade
- original_sentence text not null
- improved_sentence text not null
- explanation text not null
- mistake_type text
- created_at timestamp with time zone default now()

App behavior:
On the New Writing page:
- Show input for title.
- Show large textarea for original writing.
- Show live word count.
- Show button: "Analyze Writing".
- When clicked, send the text to `/api/analyze-writing`.

The `/api/analyze-writing` route should:
- Require a logged-in user.
- Accept `title` and `original_text`.
- Analyze the writing with OpenAI first.
- Use free OpenRouter models if OpenAI is not available or fails.
- Return strict structured JSON with overall score, metric scores, improved text, main advice, and sentence feedback.
- Save the writing entry, scores, and feedback with Prisma.
- Return the created entry id.

Design requirements:
- Premium Apple-inspired UI.
- Light and dark mode.
- Liquid Glass visual style with translucent surfaces, soft blur, subtle borders, gentle shadows, rounded corners, layered depth, and smooth transitions.
- Minimal, readable, responsive layouts.
- Friendly empty states, loading states, and clear errors.
- Result pages should make original and improved writing easy to compare.
- Analytics should show score trends and average metric scores with Recharts.

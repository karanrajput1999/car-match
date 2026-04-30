# 🚗 Car Match

## What did you build and why?

Car Match is a preference-driven car recommendation tool that helps users cut through the noise and find the right car for their lifestyle. Instead of manually researching specs across multiple tabs, users can:

- **Shortlist cars** they're interested in (saved to localStorage)
- **AI Search** — describe what you're looking for in plain language ("affordable SUV with good safety for family use") and get matched to relevant cars instantly, no filters or dropdowns needed
- **AI Chat** — a conversational interface where you can go deeper, ask follow-up questions, refine your preferences, and have a back-and-forth dialogue until you're confident in your choice

The motivation was to make car buying research faster and more personalized — instead of generic spec tables, you get answers tailored to how you actually plan to use the car.

## What did you deliberately cut?

- **Database / Auth** — kept it out intentionally. Since there's no user authentication or need to persist data server-side, localStorage was sufficient. Adding a database would have over-engineered a small project.
- **Chat history persistence** — would have required storing conversation context in a database and re-injecting it into every API call, which would eat into the free token limit significantly.
- **RAG (Retrieval-Augmented Generation)** — considered it as a way to reduce token consumption by only feeding relevant car chunks to the model, but cut it due to time constraints. It remains the right long-term solution.
- **Separate backend service** — would have used a dedicated backend for the AI layer in a production setup, but kept it in a single Next.js codebase for simplicity and faster deployment.
- **Larger car dataset** — more features and UI sections were limited by the dataset size. With a richer dataset, more filtering, recommendation, and comparison features would have made sense.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js | SSR out of the box — car listing and recommendation pages are fully indexable, which matters for SEO. Single codebase for frontend + API routes also kept the project lean and easy to deploy |
| AI Model | meta-llama/llama-4-scout-17b-16e-instruct via Groq | Generous free tier with fast inference |
| Storage | localStorage | No auth, no user data — localStorage is sufficient |
| Dataset | Custom (20+ cars) | No suitable free API covered all required fields |

## What did you delegate to AI tools vs. do manually?

**Delegated to AI:**
- Boilerplate setup and component scaffolding
- Writing prompt templates for car comparison queries
- Drafting repetitive UI patterns

**Done manually:**
- Designing the car dataset schema and populating 20+ car entries
- Deciding the product flow (shortlist → compare → ask AI)
- Prompt engineering and tuning to get useful, use-case-aware responses
- Handling token limit constraints and deciding what context to send per request

## Where did the tools help most?

- Speeding up initial setup and boilerplate — Next.js scaffolding, component structure
- Generating structured prompt templates that produced consistent AI responses
- Iterating on UI quickly without getting stuck on syntax

## Where did they get in the way?

- Token limits were a constant constraint — the free Groq API key limited how much context (chat history, car data) could be passed per request, forcing tradeoffs in what context to include
- AI-suggested approaches sometimes over-engineered solutions (e.g. suggesting a full backend + DB setup) when simpler solutions worked fine for the scope

## If you had another 4 hours, what would you add?

- **Car comparison with AI Q&A** — let users select 2 or more cars from their shortlist and ask questions specifically about those cars (e.g. "Which of these is better for highway driving?" or "Which has the best safety rating for a family?"), so the AI answers in context of their exact choices rather than the full dataset
- **RAG system** — chunk the car dataset and retrieve only relevant cars per query, significantly reducing token usage and allowing richer datasets
- **Persistent chat history** — store conversation context in a database so users can resume previous comparisons
- **Larger car dataset** — integrate a proper car API (e.g. NHTSA + CarQuery) to expand beyond 20 cars and unlock more filtering/recommendation features
- **Dedicated AI backend** — move the AI service layer to a separate backend so it can scale independently from the frontend, with proper rate limiting, caching, and the ability to swap models or providers without touching the UI layer

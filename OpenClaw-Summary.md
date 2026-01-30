# OpenClaw.ai — Summary

OpenClaw is a free, open-source, self-hosted personal AI assistant. It runs on your own hardware (macOS, Windows, Linux) and connects to LLM backends (Anthropic Claude, OpenAI, or local models). You interact with it through messaging platforms you already use.

## Core Capabilities

- **Full system access** — file read/write, shell commands, script execution (sandboxed mode available)
- **Persistent memory** — retains context, preferences, and conversation history across sessions 24/7
- **Browser automation** — controls Chrome/Chromium for browsing, form filling, data extraction
- **Voice interaction** — always-on speech via wake word (macOS/iOS/Android), ElevenLabs TTS
- **Device control** — camera, screen recording, location services, system notifications
- **Scheduling** — cron jobs, webhooks, and event-driven automation
- **Self-improving skills** — can write/modify its own skills; community skill library with hot-reloading
- **Agent coordination** — multiple isolated agent sessions can message each other

## Chat Integrations

WhatsApp, Telegram, Discord, Slack, Signal, iMessage, Google Chat, Microsoft Teams, Matrix, Zalo, WebChat — plus native companion apps for macOS, iOS, and Android.

## Service Integrations (50+)

Spotify, Philips Hue, Obsidian, Twitter/X, Gmail, GitHub, Todoist, WHOOP, Lemonade Insurance, WordPress, Google Cloud, and more.

## Use Cases

- **Email & calendar** — inbox management, flight check-ins, scheduling
- **Code & development** — run tests, fix errors autonomously, GitHub integration
- **Smart home** — control lights, devices, and automations
- **Health & wellness** — aggregate wearable data, generate summaries, custom meditations with TTS
- **Content & web** — create websites from mobile, manage WordPress, post to social media
- **Documents & knowledge** — organize files, search and retrieve information, Obsidian integration
- **Task automation** — cross-platform workflows combining multiple services

## Deployment Options

- npm / pnpm / bun (local)
- Docker
- Nix
- Tailscale Serve/Funnel for remote access
- SSH tunnels

## Cost

The software is free and open source. You need an LLM backend: Anthropic Claude (Pro/Max), OpenAI (ChatGPT/Codex), or local models (free but hardware-intensive).

## Alternatives & Similar Projects

### Open Interpreter
Natural-language interface to your local machine — runs code via terminal, filesystem, and browser. Most similar to OpenClaw in concept but more developer-focused and lacks messaging platform integration.
- https://openinterpreter.com

### Leon AI
Open-source personal assistant that runs on your server. Currently undergoing a major rewrite toward fully autonomous agentic architecture, including auto-generating its own skills. ~17k GitHub stars.
- https://getleon.ai
- https://github.com/leon-ai/leon

### Khoj
Self-hosted AI assistant that can build agents, schedule automations, and search across your documents and the web.
- https://khoj.dev

### Jan.ai
Run open-source LLMs locally with a ChatGPT-like UI. Also supports cloud models. 40k+ GitHub stars. More of a chat interface than an autonomous agent — no system access or messaging platform integration.
- https://jan.ai

### LocalAI
Drop-in OpenAI API replacement that runs on consumer hardware with no GPU required. More of a backend/API layer than a personal assistant.
- https://github.com/mudler/LocalAI

### How OpenClaw Differs
OpenClaw's main differentiator is messaging platform integration (WhatsApp, iMessage, Telegram, etc.) combined with full system access and a skill/plugin ecosystem. Most alternatives are either more developer-focused (Open Interpreter) or chat-UI focused (Jan.ai).

## Links

- Website: https://openclaw.ai
- GitHub: https://github.com/clawdbot/clawdbot

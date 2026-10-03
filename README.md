# AssemblyOS 🛸

> **AI that sees. Understands. Guides.**

AssemblyOS is an AI-powered 3D Model Assembly & Guidance Platform built with Next.js, React Three Fiber, and an intelligent copilot.

![AssemblyOS](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![Three.js](https://img.shields.io/badge/Three.js-R3F-049ef4?style=flat-square&logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎮 **Interactive 3D** | React Three Fiber viewer with orbit, zoom, pan |
| 💥 **Exploded View** | Animated component separation with spring physics |
| 🤖 **AI Copilot** | Chat assistant that controls the 3D scene |
| 🎬 **Show Me** | Animated assembly guidance with directional cues |
| 📋 **Step System** | 18-step structured DRONE-X1 assembly guide |
| 🔍 **Verification** | Simulated camera-based assembly checking |
| 📊 **Assembly Report** | Completion report with stats and download |
| 📤 **Model Import** | Drag-and-drop GLB/GLTF/OBJ/STL support |

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/assemblyos.git
cd assemblyos

# 2. Install dependencies
npm install

# 3. (Optional) Add AI key — app works without one!
cp .env.example .env.local
# Edit .env.local and add your AI_GATEWAY_API_KEY

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → click **Launch Workspace** → everything works without any external API.

---

## 🗂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── workspace/demo/     # Main assembly workspace
│   ├── workspace/import/   # Model import
│   ├── docs/               # Documentation
│   └── api/                # API routes (chat, verify, analyze)
├── components/
│   ├── landing/            # Hero, Nav, Features, CTA, Footer
│   ├── workspace/          # 3D Viewer, Sidebar, Copilot, Timeline
│   └── ui/                 # Glass panels, buttons, status dots
├── data/                   # DRONE-X1 demo product + 18 assembly steps
├── lib/ai/                 # Demo assistant, prompts, Zod schemas
├── store/                  # Zustand assembly state
└── types/                  # TypeScript interfaces
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Next step |
| `P` | Previous step |
| `E` | Toggle exploded view |
| `R` | Reset assembly |
| `F` | Show Me animation |
| `V` | Start verification |
| `C` | Focus copilot |
| `ESC` | Close panels |

---

## 🤖 AI Copilot

The copilot works in two modes:

1. **Demo mode** (no key needed) — keyword-matching assistant with full 3D action support
2. **AI mode** — set `AI_GATEWAY_API_KEY` in `.env.local` for GPT-4o-mini responses

The copilot can control the 3D viewer via structured actions:
```json
{
  "message": "I've highlighted the motor bracket.",
  "actions": [
    { "type": "highlightComponent", "componentId": "bracket-rl" },
    { "type": "focusComponent", "componentId": "motor-rl" }
  ]
}
```

---

## 🛡 Disclaimers

- Verification panel is a **DEMO SIMULATION** — not real computer vision
- Assembly report does not constitute an engineering certification
- Torque specs and safety-critical data are not provided by the AI

---

## 🧰 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **3D**: React Three Fiber + Three.js + @react-three/drei
- **Animation**: Framer Motion
- **State**: Zustand
- **Validation**: Zod
- **AI**: Vercel AI SDK (provider-agnostic)
- **Styling**: Tailwind CSS v4 + custom glass design system

---

## 📄 License

MIT — built as a portfolio / showcase project.

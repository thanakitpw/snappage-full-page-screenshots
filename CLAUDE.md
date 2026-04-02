# SnapPage

## ภาษา
- ตอบเป็นภาษาไทยเสมอ
- ตัวเว็บไซต์รองรับ 2 ภาษา: English (default) และ ไทย
- ใช้ i18n แบบง่ายๆ ด้วย React Context สลับภาษาได้

## โปรเจกต์นี้คืออะไร
**SnapPage** — เครื่องมือ screenshot เว็บไซต์แบบ full-page ในรูปแบบ Web app ให้คนทั่วโลกใช้ได้ง่าย

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Browser Engine:** playwright-core + @sparticuz/chromium (serverless)
- **Deploy:** Vercel
- **Language:** TypeScript

## โครงสร้างไฟล์
```
screenshot-website/
├── app/
│   ├── layout.tsx          # Root layout + metadata + fonts
│   ├── page.tsx            # หน้าหลัก
│   ├── api/
│   │   ├── screenshot/route.ts  # Screenshot API
│   │   └── scan/route.ts        # Scan pages API
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── screenshot-form.tsx # ฟอร์มหลัก
│   ├── scan-results.tsx    # แสดงผล scan + เลือกหน้า
│   ├── screenshot-result.tsx
│   ├── features-section.tsx
│   ├── language-toggle.tsx
│   └── header.tsx
├── lib/
│   ├── i18n.ts             # translations EN/TH
│   ├── utils.ts            # shadcn utils
│   └── chromium.ts         # Playwright + Chromium setup
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── tailwind.config.ts
├── next.config.ts
├── vercel.json
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## ฟีเจอร์
- กรอก URL → กด Screenshot → ได้รูป full-page
- Scan Pages: ใส่ URL → ระบบ crawl หาลิงก์ → เลือกหน้าที่ต้องการ screenshot
- เลือกขนาดจอ (Desktop 1920x1080 / Tablet 768x1024 / Mobile 375x667)
- เลือกฟอร์แมต (PNG / JPEG)
- ตั้ง delay ก่อน screenshot ได้ (รอหน้าโหลด)
- กดดาวน์โหลดรูปได้เลย
- สลับภาษา EN/TH

## แนวทางการเขียนโค้ด
- ใช้ TypeScript
- ใช้ App Router (Next.js 15)
- ใช้ Server Components เป็นหลัก, Client Components เฉพาะที่จำเป็น
- ฟอนต์ English: Helvetica (system font stack)
- ฟอนต์ Thai: Noto Sans Thai (next/font/google)
- ใช้ shadcn/ui components: Button, Input, Select, Card, Badge, Checkbox

## Design System
- Style: Flat Design, minimal, clean
- Primary: #3B82F6
- Secondary: #60A5FA
- CTA: #F97316
- Background: #F8FAFC
- Text: #1E293B
- Transitions: 150-200ms
- ไม่ใช้ emoji เป็น icon — ใช้ Lucide icons (มากับ shadcn)

## SEO
- ใช้ Next.js Metadata API
- ใส่ meta tags ครบ (title, description, keywords, og:tags, twitter:card)
- ใช้ semantic HTML (header, main, footer, h1-h3)
- มี structured data (JSON-LD) สำหรับ WebApplication
- มี sitemap.xml และ robots.txt
- มี canonical URL
- มี hreflang tags สำหรับ 2 ภาษา (en, th)
- รองรับ social sharing (Open Graph, Twitter Card)
- Mobile-friendly / responsive

## Skills ที่ติดตั้ง
ใช้ skill ทุกครั้งที่ทำงาน โดยเฉพาะ:
- **ui-ux-pro-max** — ออกแบบ UI/UX, เลือก color palette, typography, design system
- **playwright-skill** — Playwright browser automation
- **screenshots** — สร้าง marketing screenshot ด้วย Playwright
- **web-design-guidelines** — ตรวจสอบ web interface ตาม guidelines
- **frontend-design** — แนวทางออกแบบ frontend
- **nodejs-best-practices** — แนวทาง Node.js architecture, error handling, validation, security

### วิธีใช้ skill
- ui-ux-pro-max: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --design-system`
- playwright-skill: เขียน script ไว้ที่ /tmp แล้วรันผ่าน `cd .claude/skills/playwright-skill && node run.js /tmp/script.js`
- web-design-guidelines: fetch guidelines แล้วตรวจไฟล์

## การทำงานแบบขนาน (Subagents)
- ใช้ Subagent (Agent tool) ทำงานแบบขนานเพื่อความเร็ว
- แบ่งงานตามความถนัด เช่น frontend, backend, design
- Claude หลักเป็นคนประสานงานและตรวจคุณภาพ

# CLAUDE.md — โปรเจ็ค `frontend/`

คู่มือสำหรับ Claude เมื่อทำงานในโปรเจ็คนี้ อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

## โปรเจ็คนี้คืออะไร
ระบบประเมินภาระงาน/สมรรถนะ (workload & assessment) — **Next.js 15 (App Router)** + TypeScript
- **State/Data**: Redux Toolkit (global UI state) · React Query (server state) · Formik + Yup (ฟอร์ม)
- **UI**: Tailwind CSS · shadcn (`components.json`) · daisyui · `lucide-react` (ไอคอน)
- **HTTP**: axios ผ่าน `@/utils/http` (มี interceptor แนบ token + จัดการ cookie)
- รัน: `npm run dev` (turbopack) · ตรวจ: `npx tsc --noEmit` · `npm run lint` · `npm run format`

---

## 🔑 Workflow บังคับ: ใช้ subagent `SeniorFrontend` สำหรับงาน frontend

งาน **เขียน / แก้ / refactor / ย้าย component / เชื่อม API / รีวิวโค้ด** ฝั่ง frontend
ให้มอบหมายผ่าน subagent **`SeniorFrontend`** (อยู่ที่ `.claude/agents/SeniorFrontend.md`) เสมอ
เพราะมันถือกฎสถาปัตยกรรม/ความสม่ำเสมอของโปรเจ็คนี้ไว้ครบ

ลำดับที่ถูกต้อง:
1. **อ่าน `CLAUDE.md` (ไฟล์นี้)** เพื่อโหลด convention
2. เรียก **`SeniorFrontend`** (ผ่าน Agent tool, `subagent_type: SeniorFrontend`) ให้ลงมือ — มันจะอ่าน `CLAUDE.md` ซ้ำเองและทำตามเช็กลิสต์
3. ก่อนปิดงาน ให้ผ่าน **เช็กลิสต์ความสม่ำเสมอ** (ข้อ 5 ในไฟล์ agent) + `tsc --noEmit` / `lint`

> งานเล็กมาก (แก้ typo, ปรับ copy) ทำเองได้ ไม่ต้องเรียก agent — แต่ถ้าแตะโครงสร้าง/ API/ component ให้ใช้ `SeniorFrontend`

---

## โครงสร้างโปรเจ็ค (ปัจจุบัน)
```
src/
├── app/          route + page (App Router) — page ควรบาง, logic แยกออก
│   └── <route>/_partial/   component เฉพาะหน้านั้น (โฟลเดอร์ขึ้นต้น _ = ไม่เป็น route)
├── components/   global reusable UI ทั้งแอป (Table, Pagination, Sidebar, Topbar...)
│   └── ui/       shadcn primitive (Button, Dialog, Input) — ใช้ทั่วแอป
├── services/     service layer — เรียก API ผ่าน @/utils/http (ลงท้าย *Services.ts)
├── Types/        type/interface ทั้งหมด + barrel index.ts (import ผ่าน @/Types)
├── hooks/        custom hooks ที่ใช้ร่วม
├── stores/       Redux store + slices
├── provider/     React context / providers
├── lib/          utils กลาง (cn() อยู่ที่นี่)
└── utils/        http client (http.ts) + helpers
```

## กฎหลัก (สรุปย่อ — รายละเอียดเต็มอยู่ใน agent)

### 1. ตำแหน่ง component
- เฉพาะหน้า → `_partial/` ในหน้านั้น · ข้ามหน้าในฟีเจอร์ → `components/` ของฟีเจอร์ · ข้ามฟีเจอร์ → `src/components/` · primitive (Button/Dialog) → `src/components/ui/`
- เห็นของซ้ำหลายหน้า → ยกขึ้น global แล้วลบตัวซ้ำ · `grep` หาของเดิมก่อนสร้างใหม่เสมอ

### 2. การเชื่อม API (บังคับ)
- ผ่าน `services/*Services.ts` → `@/utils/http` เท่านั้น — **ห้าม** `axios`/`fetch`/`NEXT_PUBLIC_API` ในชั้น `app/`
- type อยู่ใน `Types/<domain>.ts` import ผ่าน `@/Types` — **ห้าม** ประกาศ interface ในไฟล์ service, **ห้าม** import type จาก `@/services/*`
- token แนบโดย interceptor แล้ว — ไม่ต้องส่ง `accessToken` เอง
- fetch ใน component ใช้ React Query (`useQuery`/`useMutation`) ไม่ใช่ `useEffect+setState` ดิบ
- รูปแบบอ้างอิง: `services/userServices.ts`

### 3. โค้ดอ่านบนลงล่าง
imports → types → constants → component (hooks → derived → handlers → effects → return) → sub-components
ไฟล์ page ไม่ควรเกิน ~150–200 บรรทัด ถ้าเกินให้แตก (data→hook, UI→`_partial`, validation→schema)

### 4. สี / ธีม (ห้าม hardcode hex)
- แบรนด์: `business1` `#2E4497` · `business2` `#69CCDE`
- semantic: `primary` `secondary` `muted` `accent` `destructive` `background` `foreground` `border` `card`
- ใช้คลาส tailwind + `cn()` จาก `@/lib/utils` · radius ใช้ `rounded-lg/md/sm` · daisyui theme = light/cupcake

## เช็กก่อนปิดงาน
`grep -r "from 'axios'\|NEXT_PUBLIC_API" src/app` = 0 · ไม่มี type ค้างในไฟล์ service · ไม่มี hex hardcode · `npx tsc --noEmit` ผ่าน · `npm run lint` ผ่าน

# Eventmaker API

Eventmaker API adalah REST API untuk manajemen event dan participant.  
Project ini dibuat sebagai latihan backend menggunakan **Hono + Prisma + SQLite** dengan fokus pada relasi data, validasi, dan logic backend.

---

## Gambaran Umum

API ini digunakan untuk:
- Membuat dan mengelola event
- Mendaftarkan participant ke event
- Menampilkan status event secara otomatis berdasarkan waktu

Event **tidak menerima status dari client**, melainkan status dihitung otomatis di backend berdasarkan waktu event.

---

## Teknologi yang Digunakan
- Node.js
- Hono
- Prisma ORM
- SQLite
- Zod (request validation)

---

## Struktur Data

### Event
Setiap event memiliki data:
- name
- description
- location
- dateTime (waktu mulai)
- endDateTime (waktu selesai)
- category (SEMINAR, WORKSHOP, CONFERENCE, MEETUP)
- type (ONLINE, OFFLINE, HYBRID)
- status (dihitung otomatis)
- participants (relasi)

### Participant
- name
- email (unik)
- eventId (relasi ke Event)

Participant akan **ikut terhapus otomatis** jika event dihapus (cascade delete).

---

## Logic Status Event (Otomatis)

Status event **tidak disimpan manual oleh user**, tetapi dihitung setiap kali event diambil.

Aturannya:
- **UPCOMING** → waktu sekarang < waktu mulai event
- **ONGOING** → waktu sekarang di antara waktu mulai & selesai
- **COMPLETED** → waktu sekarang > waktu selesai

Logic ini diterapkan langsung di proses response API, sehingga data yang diterima client **selalu up-to-date**.

---

## Fitur Event

### GET /events
Mengambil semua event.

Saat data diambil:
1. Event difilter berdasarkan query (category & type)
2. Status event dihitung otomatis
3. Jika query status ada, hasil difilter ulang setelah status dihitung

---

### GET /events/:id
Mengambil detail satu event + participant.
Status event dihitung otomatis sebelum dikirim ke client.

---

### POST /events
Membuat event baru.

Ketentuan:
- Status **tidak diterima dari request body**
- Status default akan menjadi UPCOMING
- endDateTime otomatis di-set 2 jam setelah dateTime

---

### PATCH /events/:id
Update event secara partial:
- Hanya field yang dikirim yang akan diubah
- Status tetap dihitung otomatis, bukan dari input user

---

### DELETE /events/:id
Menghapus event.
Participant yang terhubung akan ikut terhapus otomatis.

---

## Fitur Participant

### GET /participants
Mengambil semua participant beserta event-nya.

---

### GET /participants/event/:eventId
Mengambil semua participant dari satu event tertentu.

---

### POST /participants
Menambahkan participant ke event.

Validasi:
- Event harus ada
- Email participant harus unik

---

### PATCH /participants/:id
Update data participant.

---

### DELETE /participants/:id
Menghapus participant.

---

## Validasi Data

Semua request body divalidasi menggunakan **Zod**:
- Event validation
- Participant validation
- Query validation (filter event)

Hal ini mencegah data tidak valid masuk ke database.

---

## Menjalankan Project

### Install dependency
```bash
pnpm install
```
### Generate Prisma Client
```bash
pnpm prisma generate
```
### Jalankan Migration
```bash
pnpm prisma migrate dev
```
### Jalankan Server
```bash
pnpm dev
```
```
open http://localhost:3000
```

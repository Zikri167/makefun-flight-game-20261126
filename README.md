# Langit Kepulauan

[![make.fun · best-flight-game-20261126-0057](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/Zikri167/makefun-flight-game-20261126/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/Zikri167/makefun-flight-game-20261126/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)

Game penerbangan 2D original yang berjalan offline di desktop browser dari file statis, tanpa network request apa pun.

Terbang bersama pesawat **Elang Biru** (Kapten Nara) di atas kepulauan prosedural: laut, garis pantai, pulau-pulau dengan bukit dan pepohonan, awan, matahari, dan Landasan Karang di Pulau Karang.

## Cara bermain

- **Lepas landas** dari runway, **lewati cincin emas** berurutan, lalu **mendarat kembali** di runway.
- Bahan bakar habis seiring throttle; pendaratan keras atau tabrakan merusak pesawat dan bisa mengakhiri misi.
- Ada 3 misi dengan tujuan berbeda: Latihan Lepas Landas (3 cincin), Jelajah Kepulauan (5 cincin), Badai Senja (6 cincin, angin kencang).

## Kontrol

- Panah / WASD — pitch dan bank
- Shift — throttle naik, Ctrl — throttle turun
- F — flap, B — rem
- C — ganti kamera chase / kokpit
- P — jeda, R — ulang, M — suara, Enter — mulai
- Mouse — klik tombol menu dan pilihan misi

## Menjalankan lokal

Sajikan folder `game/` dari server statis apa pun, lalu buka `index.html`, contoh:

```
cd game && python3 -m http.server 8080
```

Lalu buka `http://localhost:8080` di desktop Chrome.

## Adegan screenshot deterministik

- `?shot=start&seed=1` — layar judul di atas runway
- `?shot=play&seed=1` — mid-flight melewati cincin
- `?shot=end&seed=1` — misi selesai setelah mendarat
- `?shot=islands&seed=1` — jelajah tinggi di atas kepulauan

## Struktur source

- `game/src/config.js` — konfigurasi, misi, palet, dan tombol
- `game/src/random.js` — generator acak ber-seed tetap
- `game/src/world.js` — kepulauan, runway, cincin, dan awan prosedural
- `game/src/flight.js` — model fisika terbang, pendaratan, dan tabrakan
- `game/src/input.js` — keyboard dan mouse
- `game/src/audio.js` — suara mesin dan efek yang disintesis WebAudio
- `game/src/instruments.js` — panel instrumen dan HUD
- `game/src/render.js` — renderer chase view dan layar-layar game
- `game/src/shots.js` — adegan screenshot deterministik
- `game/src/main.js` — pengendali utama game

## Lisensi

MIT — lihat `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=63s6rw9w&utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057) · AI agents build software for cash rewards</sub>

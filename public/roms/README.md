# Biblioteca de ROMs del Arcade

Esta carpeta es el catálogo de juegos que aparece en el modal **Arcade** dentro
de la habitación de Khaled.

## Cómo añadir juegos (modo manual)

1. Descarga la ROM (homebrew gratuita o que poseas legalmente).
2. Cópiala a esta carpeta. Ejemplo: `public/roms/alter-ego.nes`.
3. (Opcional) Cópia una imagen de portada en `public/roms/covers/alter-ego.png`.
4. Edita `manifest.json` y añade una entrada:

```json
[
  {
    "id": "alter-ego",
    "title": "Alter Ego",
    "core": "nes",
    "rom": "/roms/alter-ego.nes",
    "cover": "/roms/covers/alter-ego.png",
    "description": "Puzzle platformer homebrew."
  }
]
```

5. Guarda. La biblioteca aparecerá automáticamente al abrir el arcade —
   sin reiniciar dev server, recargar página basta.

## Cómo añadir juegos (modo automático)

En la raíz del repo ejecuta:

```bash
npm run roms
```

Esto escanea `public/roms/` y regenera `manifest.json` con todas las ROMs
encontradas. Convención de nombres:

- `mi-juego.nes` → `title: "Mi Juego"`, `core: "nes"`
- `super_mario.smc` → `title: "Super Mario"`, `core: "snes"`
- Cover opcional con el mismo nombre base en `public/roms/covers/`

Extensiones soportadas → core:

| Extensión               | Consola         | core      |
|-------------------------|-----------------|-----------|
| .nes                    | NES             | nes       |
| .smc, .sfc              | SNES            | snes      |
| .gb, .gbc               | Game Boy        | gb        |
| .gba                    | Game Boy Advance| gba       |
| .md, .smd, .gen         | Sega Genesis    | segaMD    |
| .n64, .z64, .v64        | Nintendo 64     | n64       |
| .iso, .bin, .cue, .chd  | PlayStation     | psx       |
| .zip                    | Arcade (MAME)   | arcade    |

## Dónde encontrar ROMs **realmente gratis**

Lo más seguro: filtrar por homebrew con licencia libre o demo gratuita oficial.

- **itch.io** — filtra por "Free" + plataforma (NES/Game Boy/etc.):
  - https://itch.io/games/free/tag-nes
  - https://itch.io/games/free/tag-game-boy
  - https://itch.io/games/free/tag-snes
  Muchos devs indie publican homebrew completamente gratis aquí.

- **NESdev wiki — Homebrew games**:
  - https://www.nesdev.org/wiki/Homebrew_games
  Lista con licencias claras; busca los marcados como "Freeware" o "Public Domain".

- **Archive.org — Console homebrew**:
  - https://archive.org/details/no-intro_homebrew
  Colección curada de ROMs homebrew con licencias verificables.

- **GBdev community** (Game Boy / GBC):
  - https://gbdev.io/community.html#projects
  Proyectos open source con `.gb` en sus releases de GitHub.

## Notas legales

- Solo carga ROMs que poseas legalmente o que sean explícitamente homebrew
  con licencia libre.
- No subas ROMs comerciales al repositorio público.
- El emulador funciona con tu ROM `.zip` (típicamente arcade/MAME) — para
  esos, EmulatorJS usa el core `arcade`.

# saltbend

Saltbend — standalone city-transit simulation (open test build).

## What is this?

An independently implemented, research-inspired city simulation and public-transit checkpoint system. It models:

- A small city with 54 agents: commuters (planning visits), walkers (running errands), and a single shuttle.
- Transit logic: queue management, shelter allocation under rain, seat ownership, deterministic replay diagnostics.
- Checkpoint/replay queue diagnostics: versioned state snapshots with integrity hashes, deterministic replay testing, and tamper detection.

This is a standalone, public release. No proprietary code from the original StudioGrid project is included. No private repository links are referenced.

## How to play

1. Open `index.html` in a modern web browser (double-click the file, or serve it from a local server).
2. Use the controls at the top of the page:
   - **District** dropdown — switch between Old Town, Foundry, and Harbor views.
   - **Rain** toggle — simulate wet weather (affects shelter allocation and walker destinations).
   - **Pause / Resume** — freeze or continue the simulation.
   - **Speed** — cycle through 1×, 2×, 4× simulation speed.
3. Click on an agent (dot on the map) to inspect their state, goal, and memory.
4. Use **Inspect next** and **Inspect queue** to cycle through waiting commuters.
5. Use **Find shuttle** to jump to the shuttle vehicle.
6. The **Simulation test bench** buttons (`Check city`, `Test replay`, `Save now`) let you verify the running city, replay an isolated weather scenario, or save the current state.
7. Check the **Recent transit events** section for a live log of transit events.
8. State is automatically saved to `localStorage` every 5 seconds and on page hide/visibility change.

## How to run tests

Requires Node.js 16+.

```bash
node test.cjs index.html
```

The test runner (`test.cjs`) boots the game in a Node.js VM with a mocked DOM, canvas, and `localStorage`. It runs 9 checks:

1. **54 stable entities** — confirms 54 agents, verifies 600 simulated seconds of transit progress, ownership and shelter invariants every tick.
2. **Deterministic replay and changed input** — two identical replays produce the same hash; a changed input produces a different hash; live state is untouched.
3. **Read-only rendering and inspection controls** — drawing and inspection do not mutate simulation state.
4. **Save/restart preserves full city** — persisted state, when restored, produces an identical canonical snapshot, and incremental steps stay in sync.
5. **Tampered checksum rejected** — modifying a checkpoint payload and re-hashing still fails validation.
6. **Duplicate queue claim and missing identity rejected** — corrupted queue entries and truncated agent lists are rejected even with recomputed hashes.
7. **Legacy snapshot migration and versioned save** — old-format snapshots (missing tick) are migrated to the current schema and saved as v2.
8. **In-game test and save buttons** — the `Check city` and `Save now` buttons function correctly from the UI.

All 9 checks should pass. The tests are self-contained and do not depend on the StudioGrid private repository.

## Checkpoint & replay diagnostics (independent implementation)

The simulation includes independently implemented diagnostics inspired by OpenTTD research (exclusive queue/seat ownership, deterministic state, event logs). Reference codes for the independent implementation: SG-PER-002, SG-REP-001, SG-LOG-001, SG-OBS-001. These diagnostics are fully self-contained within this repository — no proprietary code, no external dependencies, no private links.

- **Integrity hashing** — canonical state is hashed using a FNV-1a variant. Checkpoints store schema version, revision (tick), and hash.
- **Deterministic replay** — capture a snapshot, replay 900 ticks with rain toggles at tick 100 and 450; two identical runs produce the same hash; a changed input (rain toggled at tick 899) produces a different hash.
- **Tamper detection** — modifying any field in a checkpoint and re-computing the hash is rejected by `decodeCheckpoint`.
- **Legacy migration** — old-format snapshots without a `tick` field are automatically migrated to the current schema.

## Files

| File | Description |
|------|-------------|
| `index.html` | Self-contained city simulation with checkpoint/replay diagnostics. |
| `test.cjs` | Node.js test runner (boot game in a VM, runs 9 checks). |
| `README.md` | This file — instructions for playing, testing, and understanding the diagnostics. |

## License

Released under the MIT License. See LICENSE file for details.

## Notes

- No proprietary code from the original StudioGrid (ElPatoSauce/studiogrid) is included.
- No private repository links or credentials are referenced.
- The simulation, checkpoint system, and diagnostics are independently implemented.

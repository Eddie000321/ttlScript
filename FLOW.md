# Button Flow Examples

This document shows the step-by-step flow for each button in the Networking Lab Assistant.

---

## 🔧 Utilities

### Theme Toggle (🌙 / ☀️)
Toggle between dark and light mode. Preference is saved to localStorage.

```
[Click Button] → Theme switches → Preference saved
```

---

### Auto-Enter (▶ Start Auto-Enter)
Sends Enter key every 500ms to test device connectivity.

```
[Click ▶ Start Auto-Enter]
    ↓
[System] Auto-Enter started (every 500ms)
    ↓
Sends "Enter" → waits 500ms → Sends "Enter" → ...
    ↓
[Click ■ Stop Auto-Enter]
    ↓
[System] Auto-Enter stopped
```

---

## ✓ Quick Reset (Password Known)

### Router Quick Reset (⬛ Black Device)
For routers where you can access CLI.

```
[Click "Quick Reset Router"]
    ↓
Step 1: Try password: (empty) → class → cisco
    ↓
enable
    ↓
Step 2: write erase
    ↓
[confirm] → Enter
    ↓
Step 3: reload
    ↓
[confirm] → Enter
    ↓
✅ Router reset complete
```

**Progress Indicators:**
- 🔵 Blue (pulsing): Current step
- 🟢 Green: Completed
- 🔴 Red: Failed

---

### Switch Quick Reset (⬜ White Device)
For switches where you can access CLI.

```
[Click "Quick Reset Switch"]
    ↓
Step 1: Try password: (empty) → class → cisco
    ↓
enable
    ↓
Step 2: write erase
    ↓
[confirm] → Enter
    ↓
Step 3: delete vlan.dat
    ↓
[confirm] → Enter → Enter
    ↓
Step 4: reload
    ↓
[confirm] → Enter
    ↓
✅ Switch reset complete
```

---

## ⚠ Password Recovery / Factory Reset

### Router Password Recovery (⬛ ISR / ASR)
For locked-out routers requiring ROMMON mode.

```
[Manual] Turn OFF router
    ↓
[Manual] Turn ON router
    ↓
[Click "Send Break"] repeatedly (or Ctrl+Break)
    ↓
Wait for: rommon 1 >
    ↓
[Click "Start Router Recovery"]
    ↓
confreg 0x2142
    ↓
reset
    ↓
Wait for: initial configuration dialog (up to 10 min)
    ↓
no → Enter
    ↓
Wait for: Router>
    ↓
enable → write erase → config-register 0x2102
    ↓
reload
    ↓
✅ Router factory reset complete
```

---

### Switch Factory Reset (⬜ 2960/3560/3750)
For locked-out switches requiring MODE button.

```
[Manual] Unplug power cable
    ↓
[Manual] Press & Hold MODE button (Light Gray)
    ↓
[Manual] Plug power back in (keep holding)
    ↓
Wait ~15s for: switch:
    ↓
[Click "Start Switch Reset"]
    ↓
flash_init
    ↓
delete flash:config.text
    ↓
delete flash:vlan.dat
    ↓
reset
    ↓
Wait for: initial configuration dialog (up to 5 min)
    ↓
no → Enter
    ↓
Wait for: Switch>
    ↓
enable → write erase → reload
    ↓
✅ Switch factory reset complete
```

---

### 9200 Series Recovery (🟫 Catalyst 9200/9300)
For locked-out Catalyst 9200/9300 switches.

```
[Manual] Unplug power
    ↓
[Manual] Press & Hold MODE button
    ↓
[Manual] Reconnect power (keep holding)
    ↓
Wait for: switch:
    ↓
[Click "Start 9200 Recovery"]
    ↓
SWITCH_IGNORE_STARTUP_CFG=1
    ↓
boot
    ↓
Wait for boot (up to 10 minutes)
    ↓
Wait for: Switch>
    ↓
enable → write erase → reload
    ↓
✅ 9200 factory reset complete
```

---

## Device Color Reference

| Icon | Device Type |
|:----:|-------------|
| ⬛ Black | Router (ISR/ASR) |
| ⬜ White | Switch (2960/3560/3750) |
| 🟫 Gray | Catalyst 9200/9300 |

---

*Back to [README](README.md)*

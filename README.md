# Networking Lab Assistant

A single-file web application for automating Cisco device recovery and reset procedures using the Web Serial API.

![Browser Support](https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **🚀 Quick Start**: Open `NetworkingLabRecoveryXterm_Offline.html` in **Chrome** or **Edge**, and you're ready to go! (No internet required)

> 📖 **Docs**: See [FLOW.md](FLOW.md) for step-by-step button flows and [docs/button_flows.md](docs/button_flows.md) for trigger conditions and detailed logic.
<img width="1352" height="915" alt="Screenshot 2026-01-26 at 2 51 16 PM" src="https://github.com/user-attachments/assets/a4c7ec22-3efe-460c-914d-70be15d24865" />


## Features

### 🔧 Utilities
- **Auto-Enter**: Sends Enter key every 500ms to test device connectivity
- **Dark/Light Mode**: Toggle theme with 🌙/☀️ button (preference saved to localStorage)

### ✓ Quick Reset

#### Router Reset
| Variant | When to Use | Steps |
|---------|-------------|-------|
| **for Password:** | Click when you see `Password:` prompt | Try `cisco/class` pairs → `enable` → `write erase` → `reload` (decline save) |
| **for No Password** | Click when you see `Router>` prompt | `en` → `wr er` → `reload` |

#### Switch Reset
| Variant | When to Use | Steps |
|---------|-------------|-------|
| **for Password:** | Click when you see `Password:` prompt | Try `cisco/class` pairs → `enable` → `write erase` → `delete vlan.dat` → `reload` (decline save) |
| **for No Password** | Click when you see `Switch>` prompt | `en` → `wr er` → `delete vlan.dat` → `reload` |

### ⚠ Password Recovery / Factory Reset (Password Unknown)
For locked-out devices requiring physical intervention.

| Device | Mode Entry | Key Steps |
|--------|------------|--------------|
| **Router (Auto)** | Script sends Break → ROMMON | `confreg 0x2142` → `reset` → boot → `config-register 0x2102` → `write erase` → `reload` |
| **Router (Manual)** | Power cycle + Break signals | User turns OFF/ON, script sends Break until ROMMON, then same steps as Auto |
| **Switch (2960/3560/3750)** | MODE button + power | Delete `flash:vlan.dat`, `flash:config.text`, `flash:private-config.text` → `reset` |
| **Catalyst 9200/9300** | MODE button + power | Phase 1: `SWITCH_IGNORE_STARTUP_CFG=1` → `boot`<br>Phase 2: `enable` → `write erase` → `write memory` → `no system ignore startupconfig switch all` → `reload` |

## Files

| File | Description | Internet Required |
|------|-------------|:-----------------:|
| `NetworkingLabRecoveryXterm_Offline.html` | Standalone offline app (includes Xterm.js) | ❌ No |
| `FLOW.md` | Button flow examples | ❌ No |
| `docs/button_flows.md` | Trigger conditions + detailed logic | ❌ No |

## Requirements

- **Browser**: Google Chrome or Microsoft Edge (Web Serial API support)
- **Hardware**: USB-to-Serial adapter with appropriate drivers
- **Baud Rate**: 9600 (default for Cisco console)

## Usage

1. Open the HTML file in Chrome or Edge
2. Click **Connect** and select your serial port
3. Use **Auto-Enter** to verify device connectivity
4. Select the appropriate procedure for your device

## Device Color Indicators

| Icon | Device Type |
|:----:|-------------|
| ⬛ Black | Router (ISR/ASR) |
| ⬜ White | Switch (2960/3560/3750) |
| 🟫 Gray | Catalyst 9200/9300 |

## Progress Indicators

During Quick Reset procedures, visual progress is shown:

- 🔵 **Blue (pulsing)**: Current step executing
- 🟢 **Green**: Step completed
- 🔴 **Red**: Step failed - Retry!

## Technical Details

- **Terminal Emulation**: Xterm.js 5.3.0
- **API**: Web Serial API
- **Single File**: All HTML, CSS, and JavaScript in one file
- **Offline File Size**: ~775 KB (`NetworkingLabRecoveryXterm_Offline.html`)
- **Custom Hostname Support**: Pattern-based prompt detection works with any device hostname (e.g., `R1>`, `Core-SW#`, `Router>`, etc.)

## 🚀 Efficiency & Performance

We have significantly optimized the recovery process:

| Task | Old Manual Process | With Script | Improvement |
|------|--------------------|-------------|:-----------:|
| **Router Recovery** | ~10 mins | **< 4 mins** | **~60% Faster** |

*Automated detection of ROMMON, boot dialogs, and prompts eliminates dead air time and manual typing errors.*

## Troubleshooting

### Script Timeout
If a step times out:
1. Check the terminal output to see where it stopped
2. Continue manually by typing commands in the terminal
3. Or restart the device and try again

### Connection Issues
- Ensure correct USB-to-Serial drivers are installed
- Verify baud rate matches device (default: 9600)
- Try disconnecting and reconnecting the serial cable

## License

MIT License - Feel free to use and modify for your networking lab needs.

---

*Built with Web Serial API and Xterm.js for Cisco networking labs.*

# Networking Lab Assistant

A single-file web application for automating Cisco device recovery and reset procedures using the Web Serial API.

![Browser Support](https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> 📖 **See [FLOW.md](FLOW.md) for detailed step-by-step button flow examples.**

## Features

### 🔧 Utilities
- **Auto-Enter**: Sends Enter key every 500ms to test device connectivity
- **Auto-Enter**: Sends Enter key every 500ms to test device connectivity
- **Dark/Light Mode**: Toggle theme with 🌙/☀️ button (preference saved to localStorage)

### ✓ Quick Reset (Password Known)
For devices you can already access via CLI.

| Device | Steps | Password Testing |
|--------|-------|------------------|
| **Router** | `enable` → `write erase` → `reload` | (empty), class, cisco |
| **Switch** | `enable` → `write erase` → `delete vlan.dat` → `reload` | (empty), class, cisco |

### ⚠ Password Recovery / Factory Reset (Password Unknown)
For locked-out devices requiring physical intervention.

| Device | Mode Entry | Key Steps |
|--------|------------|-----------|
| **Router** | Break signal → ROMMON | `confreg 0x2142` → `reset` → `write erase` → `config-register 0x2102` |
| **Switch (2960/3560/3750)** | MODE button + power | `flash_init` → delete config files → `reset` |
| **Catalyst 9200/9300** | MODE button + power | `SWITCH_IGNORE_STARTUP_CFG=1` → `boot` → `write erase` |

## Files

| File | Description | Internet Required |
|------|-------------|:-----------------:|
| `NetworkingLabRecoveryXterm.html` | Online version (CDN) | ✅ Yes |
| `NetworkingLabRecoveryXterm_Offline.html` | Offline version (embedded libs) | ❌ No |

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
- **Offline Version**: ~325KB (includes embedded Xterm.js)

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

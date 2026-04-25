# Networking Lab Assistant

Single-file browser tools for Cisco lab recovery, password bypass, and reset workflows over a serial console.

The app uses the Web Serial API for the console connection and an embedded xterm.js terminal for input/output. It is designed for lab devices where wiping configuration is expected.

## Safety Warning

These scripts send destructive commands such as `write erase`, `delete vlan.dat`, `delete flash:config.text`, and `reload`. Use them only on lab devices or devices you are authorized to reset.

Before running any procedure:

- Confirm the selected button matches the exact prompt on the console.
- Keep physical access to the device during password recovery workflows.
- Expect the device to reboot and lose startup configuration.
- Stop and continue manually if the terminal output no longer matches the expected flow.

## Quick Start

1. Open `NetworkingLabRecoveryXterm_Offline.html` in Chrome or Edge.
2. Connect a USB-to-serial console adapter to the device.
3. Click `Connect` and choose the serial port.
4. Use `Start Auto-Enter` if you need to wake the console and verify output.
5. Expand the procedure card that matches the current console prompt.
6. Click `Run Script` and watch the terminal output.

No build step or local server is required. The recovery logic and terminal library are embedded in the HTML files. The pages include Google Fonts links for styling, but the core tool still works offline with browser fallback fonts.

## Requirements

- Chrome or Microsoft Edge with Web Serial API support.
- USB-to-serial adapter and the correct OS driver.
- Cisco console cable or equivalent console connection.
- Console speed: `9600` baud, as configured in the app.
- Direct physical access for ROMMON or switch bootloader recovery.

## Files

| File | Purpose |
| --- | --- |
| `NetworkingLabRecoveryXterm_Offline.html` | Main standalone recovery app. |
| `NetworkingLabRecoveryXterm_Offline_retro_mac.html` | Same recovery logic with a retro Mac styled UI. |
| `FLOW.md` | Older flow examples and operator notes. |
| `docs/button_flows.md` | Detailed trigger conditions and logic notes. |
| `README.md` | Current project overview and usage guide. |

Treat the HTML files as the source of truth for behavior. If you change a workflow, update both HTML variants because the JavaScript logic is duplicated.

## Interface Overview

The app has two main areas:

- Terminal pane: live xterm.js serial console. Keyboard input is forwarded to the connected serial port.
- Procedure pane: collapsible cards for quick resets and factory recovery workflows.

Header controls:

- `Connect` / `Disconnect`: opens or closes the Web Serial session.
- Theme toggle: switches dark/light mode and stores the preference in `localStorage`.
- Font size control: adjusts terminal font size from `10` to `26` and stores the value in `localStorage`.

Utility control:

- `Start Auto-Enter`: sends an empty Enter every 500 ms until clicked again. Use it to wake a console, clear "Press RETURN" prompts, or confirm the serial session is receiving output.

## Button Reference

### Quick Reset Workflows

Use these when the device is already booted and you can see a normal Cisco prompt or password prompt.

| Button | Start when you see | Main commands and behavior |
| --- | --- | --- |
| `Router Reset for Password:` | `Password:` | Tries password pairs `cisco/class`, `class/cisco`, `cisco/cisco`, `class/class`; enters enable mode with `cisco` or `class` if needed; runs `write erase`; reloads and declines saving. |
| `Router Reset for No Password` | `Router>` or another hostname ending in `>` | Sends `en`, runs `wr er`, confirms erase, waits for completion, then reloads. |
| `Switch Reset for Password:` | `Password:` | Tries the same four password pairs; enters enable mode if needed; runs `write erase`; deletes `vlan.dat`; reloads and declines saving. |
| `Switch Reset for No Password` | `Switch>` or another hostname ending in `>` | Sends `en`, runs `wr er`, deletes `vlan.dat`, then reloads. |

The password workflows support one-step and two-step login prompts. For example, a device may accept the first password directly, or it may ask for a second password before reaching `>` or `#`.

### Factory Recovery Workflows

Use these when you are locked out or need a deeper reset path.

| Button | Start when you see | Main commands and behavior |
| --- | --- | --- |
| `Router Recovery (Auto)` | A running router console | Sends `reload`, handles save/proceed prompts, sends repeated BREAK signals for up to 60 seconds until `rommon 1 >`, then runs the shared router recovery sequence. |
| `Router Recovery (Manual)` | Router is being power-cycled | You power the router off/on, then the script sends repeated BREAK signals for up to 120 seconds until `rommon 1 >`, then runs the shared router recovery sequence. |
| `Switch Factory Reset` | `switch:` bootloader prompt | Deletes `flash:vlan.dat`, `flash:config.text`, and `flash:private-config.text`, then sends `reset`. |
| `9200 Recovery - Phase 1 (Boot)` | Catalyst 9200/9300 `switch:` prompt | Sends `SWITCH_IGNORE_STARTUP_CFG=1`, then `boot`. Wait for the switch to boot to a user prompt before Phase 2. |
| `9200 Recovery - Phase 2 (Reset)` | `Switch>` or another hostname ending in `>` | Sends `enable`, `write erase`, `write memory`, `conf t`, `no system ignore startupconfig switch all`, exits config mode, then reloads. |

Shared router recovery sequence after ROMMON:

1. Send `confreg 0x2142`.
2. Wait for `rommon 2 >`.
3. Send `reset`.
4. Wait 110 seconds for boot.
5. Detect the initial configuration dialog and answer `no` when it appears.
6. Send wake-up Enters and wait for a normal prompt.
7. Enter enable mode.
8. Run `conf t`.
9. Restore normal boot with `config-register 0x2102`.
10. Run `write erase`.
11. Reload and decline saving if prompted.

## Runtime Logic

The automation is intentionally simple:

- The app accumulates device output in `globalBuffer`.
- `waitForAny()` looks for exact text patterns such as `Password:`, `#`, `switch:`, `confirm`, `Save?`, and `rommon 1 >`.
- `sendCmd()` writes a command followed by carriage return.
- `sendBreakSignal()` uses Web Serial `setSignals({ break: true })` to trigger ROMMON during router recovery.
- Progress bars are shown for the quick reset workflows.

Prompt detection is hostname-tolerant in many places because the scripts often wait for `>` or `#` instead of only `Router>` or `Switch>`. This helps with prompts such as `R1>`, `SW1#`, or `C9200>`.

## Troubleshooting

### Buttons stay disabled

The procedure buttons are enabled only after a successful serial connection. Click `Connect`, choose the port, and confirm that the status changes to `Connected`.

### Browser does not support serial

Use Chrome or Edge. Safari and Firefox do not provide the required Web Serial API.

### Nothing appears in the terminal

- Check the USB-to-serial adapter driver.
- Confirm the console cable is connected to the device console port.
- Verify the device uses `9600` baud.
- Click `Start Auto-Enter` to wake the console.
- Disconnect and reconnect the serial session if the adapter was unplugged.

### A script times out

The app stops waiting when expected text is not seen in time. Read the terminal output, continue manually from the current Cisco prompt, or restart the workflow from a known prompt.

### Router auto recovery cannot reach ROMMON

Use `Router Recovery (Manual)`. Power-cycle the router, click the manual recovery button immediately, and let the script send BREAK signals during early boot.

### Switch factory reset fails at `switch:`

Some older switch bootloaders may require manual preparation before deletes are available. If delete commands fail, run the bootloader initialization command required by that model manually, then retry the reset button or continue manually.

### Catalyst 9200/9300 still asks for a password after Phase 1

Repeat Phase 1 from the `switch:` prompt. Once the switch boots to a user prompt without the startup config, run Phase 2.

## Development Notes

- There is no package manager, build system, or backend.
- xterm.js `5.3.0` and xterm-addon-fit `0.8.0` are bundled directly inside each HTML file.
- The main and retro Mac HTML files contain duplicate recovery logic; keep them synchronized.
- Documentation in `FLOW.md` and `docs/button_flows.md` is useful for flow history, but the executable behavior is in the HTML files.
- The current app is a personal lab/test version credited in the page footer.

## Credits

Created by Jaehyeok Lee.

The page footer credits Leo Laurencio and Nhat Quang Nguyen. The terminal is powered by bundled xterm.js and xterm-addon-fit code with their license headers preserved in the HTML.

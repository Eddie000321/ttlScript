# NetworkingLabRecovery - Button Flow Documentation

This document describes the **Trigger Conditions** (when to use) and **Execution Flow** (what it does) for each button in the interface.

---

## 1. Quick Reset Buttons
> **Use these when the device is fully booted and showing a prompt.**

### 1-EXP-A. Router Auto Reset (Experimental)
- **Trigger Condition:** Click when the router is running and the console is connected, even if the current prompt is not clear yet.
- **Use Case:** Let the app send Enter, detect the router state, and choose the matching quick reset flow.
- **Logic:**
  1. Sends Enter every 500 ms for up to 30 seconds until `Password:`, `>`, or `#` is detected.
  2. If `Password:` is detected, runs **Router Reset for Password**.
  3. If `(config...)#` is detected, sends `end`, then starts a fresh 30-second prompt detection window.
  4. If plain `#` is detected, sends `disable`, then starts a fresh 30-second prompt detection window.
  5. If a user prompt ending in `>` is detected, sends `en` to test enable access.
  6. If `enable` asks for `Password:`, routes to **Router Reset for Password**.
  7. If privileged prompt `#` is reached, runs **Router Reset for No Password**.

### 1-EXP-B. Switch Auto Reset (Experimental)
- **Trigger Condition:** Click when the switch is running and the console is connected, even if the current prompt is not clear yet.
- **Use Case:** Let the app send Enter, detect the switch state, and choose the matching quick reset flow.
- **Logic:**
  1. Sends Enter every 500 ms for up to 30 seconds until `Password:`, `>`, or `#` is detected.
  2. If `Password:` is detected, runs **Switch Reset for Password**.
  3. If `(config...)#` is detected, sends `end`, then starts a fresh 30-second prompt detection window.
  4. If plain `#` is detected, sends `disable`, then starts a fresh 30-second prompt detection window.
  5. If a user prompt ending in `>` is detected, sends `en` to test enable access.
  6. If `enable` asks for `Password:`, routes to **Switch Reset for Password**.
  7. If privileged prompt `#` is reached, runs **Switch Reset for No Password**.

### 1-A. Router Reset for Password:
- **Trigger Condition:** Click when you see the `Password:` prompt.
- **Use Case:** You are locked out by a console password but want to wipe the device quickly.
- **Logic:**
  1. Tries password pairs (`cisco` / `class`).
  2. Enters `enable` mode.
  3. Sends `write erase` -> `confirm`.
  4. Sends `reload` -> Handles `Save? [yes/no]` with `no`.

### 1-B. Router Reset for No Password
- **Trigger Condition:** Click when you see the `Router>` prompt (User Mode).
- **Use Case:** The router has no passwords set, and you want to wipe it.
- **Logic:**
  1. Sends `enable` (expects no password).
  2. Sends `write erase` -> `confirm`.
  3. Sends `reload` -> Handles `Save? [yes/no]` with `no`.

### 1-C. Switch Quick Reset
- **Trigger Condition:** Click when you see a `Switch>` prompt or `Password:` prompt.
- **Use Case:** Wiping a switch that is currently running.
- **Logic:**
  1. Tries passwords (`cisco` / `class`) if needed.
  2. Enters `enable` mode.
  3. Sends `write erase`.
  4. Sends `delete vlan.dat` (Important for switches).
  5. Sends `reload` -> Handles confirmation.

---

## 2. Password Recovery / Factory Reset
> **Use these when you are LOCKED OUT or the device needs a full physical reset.**

### 2-A. Router Recovery (Manual)
- **Trigger Condition:** Device is OFF (Power Cycle).
- **Use Case:** Router recovery when you need to catch ROMMON during power-on.
- **Logic:**
  1. Manual Step: Turn device OFF -> ON.
  2. Script sends **BREAK signals** immediately to catch ROMMON.
  3. Once `rommon 1 >` is detected, runs the shared router recovery sequence.

### 2-B. Switch Factory Reset (Boot Mode)
- **Trigger Condition:** Device is at `switch:` prompt (Bootloader).
- **Use Case:** Locked switch (2960/3560/3750). Requires holding 'MODE' button during power-on.
- **Logic:**
  1. Sends `flash_init`.
  2. Deletes config files:
     - `delete flash:vlan.dat`
     - `delete flash:config.text`
     - `delete flash:private-config.text`
  3. Sends `reset` to reboot.

### 2-C. 9200 Recovery
- **Trigger Condition:** Catalyst 9200/9300 at `switch:` prompt.
- **Use Case:** Newer Catalyst switches use a specific variable to bypass password.
- **Phase 1 (Boot):**
  1. Sends `SWITCH_IGNORE_STARTUP_CFG=1`.
  2. Sends `boot`.
- **Phase 2 (Reset):** (Click after Phase 1 boot is complete)
  1. Enters `enable` mode (now bypassed).
  2. Sends `write erase`.
  3. Restores variable: `no system ignore startupconfig switch all`.
  4. Sends `reload`.

---

## 3. Utility Buttons

### 3-A. Test Connection
- **Trigger Condition:** Serial port connected.
- **Logic:** Sends an empty `Enter` to see if the device responds. Displays the detected prompt/state.

---

## 4. Helper Logic Details

### Smart Boot Wait (Time-Based Strategy)
Instead of complex prompt detection which can fail due to log flooding, the Router Recovery now uses a robust time-based sequence:
1. **Hard Wait:** 110 seconds (covers most boot times).
2. **Dialog Check:** Specifically looks for `[yes/no]` prompt to bypass the setup wizard.
3. **Log Bypass:** Waits an extra 15 seconds for `GDOI`/`ISAKMP` logs to flush.
4. **Final Wake-up:** Sends 3 Enters to ensure the prompt appears.

### Reload Confirmation
To prevent "hanging" at the final confirmation step (`Proceed with reload?`), the script now sends **3 consecutive Enters** (0.5s interval) to ensure the device acknowledges the command.

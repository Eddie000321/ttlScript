# NetworkingLabRecovery - Button Flow Documentation

This document describes the **Trigger Conditions** (when to use) and **Execution Flow** (what it does) for each button in the interface.

---

## 1. Quick Reset Buttons
> **Use these when the device is fully booted and showing a prompt.**

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

### 2-A. Router Recovery (Auto)
- **Trigger Condition:** Device is ON (running).
- **Use Case:** Standard recovery for ISR/ASR routers.
- **Logic (Time-Based):**
  1. Sends `reload`.
  2. Auto-sends **BREAK signals** to force ROMMON mode.
  3. **ROMMON:** Sends `confreg 0x2142` -> `reset`.
  4. **Boot Wait (1m 50s):** Blindly waits for reboot.
  5. **Config Check:** Waits for `Initial Configuration Dialog`.
     - If found, sends `no`.
  6. **Wait 15s:** Waits for logs to settle.
  7. **Wake-up:** Sends Enters to get `Router>` prompt.
  8. **Recovery Commands:**
     - `enable`
     - `conf t`
     - `config-register 0x2102` (Restore normal boot)
     - `end`
     - `write erase` (Wipe config)
     - `reload` (Reboot clean)

### 2-B. Router Recovery (Manual)
- **Trigger Condition:** Device is OFF (Power Cycle).
- **Use Case:** Fallback if Auto fails, or device is stuck.
- **Logic:**
  1. Manual Step: Turn device OFF -> ON.
  2. Script sends **BREAK signals** immediately to catch ROMMON.
  3. Once `rommon 1 >` is detected, follows the same steps as **Auto Recovery** (Step 3 onwards).

### 2-C. Switch Factory Reset (Boot Mode)
- **Trigger Condition:** Device is at `switch:` prompt (Bootloader).
- **Use Case:** Locked switch (2960/3560/3750). Requires holding 'MODE' button during power-on.
- **Logic:**
  1. Sends `flash_init`.
  2. Deletes config files:
     - `delete flash:vlan.dat`
     - `delete flash:config.text`
     - `delete flash:private-config.text`
  3. Sends `reset` to reboot.

### 2-D. 9200 Recovery
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

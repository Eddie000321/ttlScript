# NetworkingLabRecovery - Button Flow Documentation

This document describes the trigger conditions and execution flow for each button.

---

## Quick Reset Buttons

### 1. Router Quick Reset

**Trigger Condition:** Click when you see `Password:` prompt

**Execution Flow:**
```
1. send: "enable"
2. wait for: ["Password:", "Router#", "Switch#", "Router>", "Switch>"]
   - if "Router#" or "Switch#" → already enabled, continue
   - if "Router>" or "Switch>" → already at user prompt, continue
   - if "Password:" → try passwords
3. Password attempts (in order):
   a. send: "cisco" → wait for ["Password:", "Router#", "Switch#", "% "]
   b. send: "class" → wait for ["Password:", "Router#", "Switch#", "% "]
   c. if Router> returned → send "enable" → try "class" then "cisco" for enable
4. send: "write erase"
5. wait for: ["confirm", "]", "[confirm]"]
6. send: "" (Enter)
7. wait for: ["Router#", "Switch#"]
8. send: "reload"
9. wait for: ["Save?", "yes/no", "Proceed", "confirm"]
   - if "Save?" or "yes/no" → send "no"
10. wait for: ["Proceed", "confirm"] → send ""
11. COMPLETE
```

---

### 2. Router Quick Reset V2

**Trigger Condition:** Click when you see `Router>` prompt (NO PASSWORD)

**Execution Flow:**
```
1. send: "en"
2. wait for: ["Router#", "Switch#"] (timeout: 10s)
   - if timeout → ERROR
3. send: "wr"
4. wait for: ["[OK]", "Router#", "Switch#"]
5. send: "wr er"
6. wait for: ["confirm", "]", "[confirm]"]
7. send: "" (Enter)
8. wait for: ["Erase of nvram: complete", "complete"] (timeout: 60s)
9. wait for: ["Router#", "Switch#"] (timeout: 60s)
10. send: "reload"
11. wait for: ["Save?", "yes/no", "Proceed", "confirm"]
    - if "Save?" or "yes/no" → send "no"
12. wait for: ["Proceed", "confirm"] → send ""
13. COMPLETE
```

---

### 3. Switch Quick Reset

**Trigger Condition:** Connected to device

**Execution Flow:**
```
1. call: tryEnableWithPasswords()
   - send: "enable"
   - try passwords: cisco, class
2. send: "write erase"
3. wait for: ["confirm", "]", "[confirm]"]
4. send: "" (Enter)
5. wait for: ["Switch#", "Router#"]
6. send: "delete vlan.dat"
7. wait for: ["?"] → send "y"
8. send: "reload"
9. wait for: ["Save?", "yes/no", "Proceed", "confirm"]
   - if "Save?" or "yes/no" → send "no"
10. wait for: ["Proceed", "confirm"] → send ""
11. COMPLETE
```

---

## Password Recovery / Factory Reset Buttons

### 4. Router Recovery (ROMMON)

**Trigger Condition:** Device is at `rommon 1 >` prompt

**Execution Flow:**
```
1. send: "confreg 0x2142"
2. send: "" (Enter)
3. wait for: ["rommon 2 >"] (timeout: 30s)
4. send: "reset"
5. send: "" (Enter)
6. call: smartBootWait(600) - handles:
   - "initial configuration dialog" → send "no"
   - "[yes/no]" → send "no"
   - "Press RETURN" → send ""
   - wait for "Router>" or "Router#" or "Switch>" or "Switch#"
   - if "rommon" → send "boot" and wait again
7. if prompt is ">" → send "enable" → wait for "Router#"
8. send: "write erase"
9. wait for: ["confirm", "]", "[confirm]"] → send ""
10. wait for: ["Router#", "Switch#"]
11. send: "conf t"
12. wait for: ["(config)#"]
13. send: "config-register 0x2102"
14. send: "end"
15. wait for: ["Router#", "Switch#"]
16. send: "reload"
17. wait for: ["Save?", "yes/no", "confirm", "Proceed"]
    - if "Save?" or "yes/no" → send "no"
18. wait for: ["confirm", "Proceed"] → send ""
19. COMPLETE
```

---

### 5. Switch Reset (Boot Mode)

**Trigger Condition:** Device is at `switch:` prompt

**Execution Flow:**
```
1. send: "flash_init"
2. wait for: ["switch:"] (timeout: 20s)
3. send: "delete flash:vlan.dat"
4. wait for: ["?"] → send "y"
5. wait for: ["switch:"]
6. send: "delete flash:config.text"
7. wait for: ["?"] → send "y"
8. wait for: ["switch:"]
9. send: "delete flash:private-config.text"
10. wait for: ["?"] → send "y"
11. wait for: ["switch:"]
12. send: "reset"
13. wait for: ["?"] → send "y"
14. COMPLETE
```

---

### 6. 9200 Recovery

**Trigger Condition:** Catalyst 9200 in Boot Mode

**Execution Flow:**
```
1. send: "SWITCH_IGNORE_STARTUP_CFG=1"
2. delay: 500ms
3. send: "boot"
4. call: smartBootWait(900) - wait for boot (up to 15 min)
   - handles "initial configuration dialog" → "no"
5. send: "enable"
6. wait for: ["Switch#", "Router#"]
7. send: "write erase"
8. wait for: ["confirm", "]", "[confirm]"] → send ""
9. wait for: ["Switch#", "Router#"]
10. send: "conf t"
11. wait for: ["(config)#"]
12. send: "no system ignore startupconfig switch all"
13. send: "exit"
14. wait for: ["Switch#"]
15. send: "write memory"
16. wait for: ["[OK]", "Switch#", "Router#"]
17. send: "reload"
18. wait for: ["Proceed", "confirm", "yes/no"] → send ""
19. wait for: ["Save?", "yes/no"]
    - if matched → send "no" → send ""
20. COMPLETE
```

---

## Utility Buttons

### 7. Test Connection

**Trigger Condition:** Serial port connected

**Execution Flow:**
```
1. send: "" (Enter)
2. wait for: ["Router>", "Router#", "Switch>", "Switch#", 
              "rommon", "switch:", ">", "#", "Password:"] (timeout: 5s)
3. Display result in terminal
4. COMPLETE
```

---

### 8. Set Test Passwords

**Trigger Condition:** Device at any prompt state

**Execution Flow:**
```
1. send: "" (Enter)
2. wait for: ["initial configuration dialog", "[yes/no]", 
              "Router>", "Switch>", "Router#", "Switch#"] (timeout: 10s)
   - if "initial configuration dialog" or "[yes/no]" → send "no"
3. wait for: ["Router>", "Switch>", "Router#", "Switch#"] (timeout: 60s)
4. if at ">" prompt → call tryEnableWithPasswords()
5. send: "conf t"
6. wait for: ["(config)#"]
7. send: "enable secret class"
8. send: "line con 0"
9. wait for: ["(config-line)#"]
10. send: "password cisco"
11. send: "login"
12. send: "exit"
13. send: "exit"
14. wait for: ["Router#", "Switch#"]
15. send: "write memory"
16. wait for: ["[OK]", "Router#", "Switch#"]
17. COMPLETE
```

---

## Helper Functions

### tryEnableWithPasswords()

**Purpose:** Try to enter privileged mode with common passwords

**Flow:**
```
1. send: "enable"
2. wait for: ["Password:", "Router#", "Switch#", "Router>", "Switch>"]
3. Cases:
   - "Router#" or "Switch#" → already enabled, return true
   - "Router>" or "Switch>" → at user prompt, return true
   - "Password:" → try passwords:
     a. send "cisco" → check result
     b. if fail, send "class" → check result
     c. if Router> returned → send "enable" → try "class" then "cisco"
4. return true/false
```

### smartBootWait(timeoutSec)

**Purpose:** Wait for device to boot, handling prompts automatically

**Watches for:**
- `Router>`, `Router#`, `Switch>`, `Switch#` → return prompt
- `rommon` → return rommon mode
- `initial configuration dialog`, `[yes/no]` → send "no", continue waiting
- Sends empty Enter every 2 seconds as keepalive

### waitForAny(patterns, timeoutSec, options)

**Purpose:** Wait for any of the specified patterns in terminal output

**Returns:** `{match: "matched pattern"}` or `null` on timeout

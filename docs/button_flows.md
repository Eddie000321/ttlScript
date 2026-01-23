# NetworkingLabRecovery - Button Flow Documentation

This document describes the trigger conditions and execution flow for each button.

---

## Quick Reset Buttons

### 1. Router Reset for Password:

**Trigger Condition:** Click when you see `Password:` prompt

**Password Pairs Tested:**
- cisco + class

- (1st)cisco + (2nd)cisco  if 3rd prompt shows password:-> send enter "" -> badpassword -> "" -> password: do another pair

- class + cisco
- class + class

**Execution Flow:**
```
1. For each password pair [pass1, pass2]:
   a. send: pass1
   b. wait for: ["Password:", ">", "#", "Bad password", "% "]
      - if ">" or "#" → SUCCESS (no 2nd password needed)
      - if "Bad password" or "% " → recover (Enter until Password:) → next pair
      - if "Password:" → send: pass2
   c. wait for: ["Password:", ">", "#", "Bad password", "% "]
      - if ">" or "#" → SUCCESS
      - else → recover → next pair

2. If at user mode (>):
   a. send: "enable"
   b. try passwords: cisco, class

3. send: "write erase"
4. wait for: ["confirm"] → send ""
5. wait for: ["#"]
6. send: "reload"
7. if Save? → send "no"
8. COMPLETE
```

---

### 2. Router Reset for No Password

**Trigger Condition:** Click when you see `>` prompt (e.g. Router>, R1>) - NO PASSWORD

**Execution Flow:**
```
1. send: "en"
2. wait for: [">", "#"] (any hostname: R1>, R2#, Router#)
3. send: "wr"
4. wait for: ["[OK]", ">", "#"]
5. send: "wr er"
6. wait for: ["confirm", "]"]
7. send: "" (Enter)
8. wait for: ["Erase of nvram: complete", "complete"] (timeout: 60s)
9. send: "reload"
10. wait for: ["Save?", "yes/no", "Proceed", "confirm"]
    - if "Save?" or "yes/no" → send "no"
11. wait for: ["Proceed", "confirm"] → send ""
12. COMPLETE
```

---

### 3. Switch Quick Reset

**Password Pairs Tested:**
- cisco + cisco
- cisco + class
- class + cisco
- class + class

**Execution Flow:**
```
1. For each password pair [pass1, pass2]:
   a. send: pass1
   b. wait for: ["Password:", ">", "#", "Bad password", "% "]
      - if ">" or "#" → SUCCESS (no 2nd password needed)
      - if "Bad password" or "% " → recover (Enter until Password:) → next pair
      - if "Password:" → send: pass2
   c. wait for: ["Password:", ">", "#", "Bad password", "% "]
      - if ">" or "#" → SUCCESS
      - else → recover → next pair

2. send: "write erase"
3. wait for: ["confirm", "]", "[confirm]"]
4. send: "" (Enter)
5. wait for: ["Switch#", "Router#"]
6. send: "delete vlan.dat"
7. wait for: ["?"] → send "y"

8. send: "reset" -> yes
9. wait for: ["Save?", "yes/no", "Proceed", "confirm"]
   - if "Save?" or "yes/no" → send "no"
10. wait for: ["Proceed", "confirm"] → send ""
11. COMPLETE
```

---

## Password Recovery / Factory Reset Buttons

### 4. Router Recovery (ROMMON)

### 4. Router Recovery (ROMMON)

**Trigger Condition:** Click button (starts with auto-reload & break)

**Execution Flow:**
```
0. send: "reload"
   - Confirm with "no" if Save? prompt appears
   - Wait for reboot
   - Auto-send BREAK signals until "rommon 1 >" appears

1. send: "confreg 0x2142"
3. wait for: ["rommon 2 >"]
4. send: "reset"
reset -> The router will restart—wait for it to fully boot.
하지만얼마나 기다려야하는지 모르고 
% Please answer 'yes' or 'no'.
Would you like to enter the initial configuration dialog? [yes/no]: 이게 나오면 no로하고 다음으로 넘어가야함 Router>가 나올수도있음

after boot
router>
5. send: "" (Enter)
6. send: "enable"
7. wait for: ["Router#"]
8. send: "write erase"
9. wait for: ["geometry of nvram"]
send ""
10. wait for: ["Router#"]
11. send: "conf t"
12. wait for: ["(config)#"]
13. send: "config-register 0x2102"
14. send: "end"
15. wait for: ["Router#"]
16. send: "reload"
if System configuration has been modified. Save? [Yes/No]:
17. send: "no"
19. COMPLETE
```

---

### 5. Switch Reset (Boot Mode)

**Trigger Condition:** Device is at `switch:` prompt

**Execution Flow:**
```
1. send: "dir flash"
2. wait for: ["switch:"] 
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
// 버튼 1 과정
run from switch: prompt
1. send: "SWITCH_IGNORE_STARTUP_CFG=1"
2. send: "boot"
If the switch reloads with a password, please repeat steps 1 and 2.

// 버튼 2 과정
Switch>가 표시되면 두번째 과정버튼을 누르게하는걸로한다
4. send: "enable"
5. wait for: ["Switch#"]
6. send: "write erase"
9. wait for: ["Switch#"]
send: "write memory"
wait for: ["Switch#"]
send ""

10. send: "conf t"
11. wait for: ["(config)#"]
12. send: "no system ignore startupconfig switch all"
check output Applying config on
if not, do again

11. wait for: ["(config)#"]
13. send: "exit"
14. wait for: ["Switch#"]
15. send: "reload"
16. wait for: ["System Configuration has been modified. Save? [Yes/No]:"]
17. send: "no"
20. COMPLETE
```


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

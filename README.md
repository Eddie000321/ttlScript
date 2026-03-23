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

### ✓ 퀵리셋

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

### ⚠ 비밀번호 미확인 팩토리리셋
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

## Button Logic (Run-Time Flow)

모든 버튼은 기본적으로 **Web Serial 연결 후에만 활성화**되며, 연결 성공 시 `enableControls(true)`에 의해 사용 가능해집니다.

- 공통 동작
  - 각 버튼은 HTML의 `onclick`에서 해당 JavaScript 함수로 바로 연결됩니다.
  - 버튼 실행 시 동작은 `sendCmd()`를 통해 명령 전송(RT with `\\r`) 후 `globalBuffer`에 누적된 출력으로 프롬프트/문구를 감지합니다.
  - 핵심 대기 유틸리티는 `waitForAny()` (`pattern`, `timeout`, 필요시 keep-alive), 필요 시 `wait()`/`smartBootWait()`를 사용합니다.
- 퀵리셋/팩토리리셋 진행 바는 `showProgress / updateProgress / completeProgress / errorProgress`로 표시됩니다.

### Utility

- `btnTestConnection` (`toggleAutoEnter`)
  - 500ms 간격으로 빈 Enter(`""`)를 반복 전송해 단말 응답 유무를 점검합니다.
  - 버튼을 다시 누르면 중단됩니다.

### 퀵리셋

- `btnRouterQuick` (Router Reset for Password) → `runRouterQuickReset()`
  1. 사용자 확인 후 콘솔 비밀번호 4개 조합(`cisco/class`, `class/cisco`, `cisco/cisco`, `class/class`)을 순차 시도
  2. 1차 비밀번호만으로 로그인되는 경우 / 2차까지 필요한 경우를 분기
  3. 패스워드 실패 시 `Bad password` 회복 루틴 수행 후 다음 조합 진행
  4. 로그인 후 필요 시 `enable` + enable password(`cisco`/`class`) 시도
  5. `write erase` → 확인 프롬프트 대응 → `reload`
  6. `Save? / yes/no / Proceed` 처리 후 완료 처리

- `btnRouterQuickV2` (Router Reset for No Password) → `runRouterQuickResetV2()`
  1. `en` 후 `>` 또는 `#` 프롬프트 확인
  2. `wr er` + 확인 응답 처리
  3. `Erase of nvram: complete` 대기
  4. `reload` 및 save/proceed 처리

- `btnSwitchQuickPass` (Switch Reset for Password) → `runSwitchQuickResetPass()`
  1. Router Password flow와 동일한 4조합 로그인 시도
  2. `#` 진입 후 `write erase`
  3. `delete vlan.dat` 확인 처리
  4. `reload` 및 save/proceed 처리

- `btnSwitchQuickNoPass` (Switch Reset for No Password) → `runSwitchQuickResetNoPass()`
  1. `en` → `#`
  2. `wr er` + 확인
  3. `delete vlan.dat` + 확인
  4. `reload` 및 save/proceed 처리

### 팩토리리셋

- `btnRouter` (Router Recovery - Auto) → `runRouterRecoveryAuto()`
  1. `reload` 실행
  2. save/proceed 관련 프롬프트 처리
  3. 60초 동안 `BREAK`를 반복 전송해 `rommon 1 >` 대기
  4. 진입 시 `runRouterRecoverySteps()` 공통 함수 실행:
     - `confreg 0x2142` → `rommon 2 >` 대기 → `reset`
     - 부팅 대기(110초 블라인드) 후 `initial configuration dialog` 감지 시 `no`
     - `enable` → `conf t` → `config-register 0x2102` → `end`
     - `write erase` → `reload` + save/confirm 처리

- `btnRouterManual` (Router Recovery - Manual) → `runRouterRecoveryManual()`
  - Auto와 동일한 복구 스텝을 사용하지만, 사용자가 전원 재시작한 뒤 BREAK 송신을 120초 대기

- `btnSwitch` (Switch Factory Reset) → `runSwitchReset()`
  1. `switch:` 대기
  2. `flash:vlan.dat`, `flash:config.text`, `flash:private-config.text` 삭제
  3. `reset` 실행 후 확인 응답

- `btn9200Boot` (9200 Recovery - Phase 1) → `run9200Boot()`
  1. `SWITCH_IGNORE_STARTUP_CFG=1` 설정
  2. `boot` 실행 후 Phase 2(`btn9200Reset`) 안내

- `btn9200Reset` (9200 Recovery - Phase 2) → `run9200Reset()`
  1. `enable` → `Switch#` 확인
  2. `write erase` → `write memory`
  3. `conf t` → `no system ignore startupconfig switch all`
  4. `exit` → `reload` + save/proceed 처리

## Runtime Notes

- `smartBootWait()`는 부팅 대기용으로 긴 로그/재시작 상황에서 `Router>`/`Switch>`/`rommon` 진입을 처리하기 위한 헬퍼이며, 현재 버튼 핸들러에서 직접 호출되지는 않습니다.

## Device Color Indicators

| Icon | Device Type |
|:----:|-------------|
| ⬛ Black | Router (ISR/ASR) |
| ⬜ White | Switch (2960/3560/3750) |
| 🟫 Gray | Catalyst 9200/9300 |

## Progress Indicators

Progress indicator meaning:

- 현재 단계
- 완료
- 실패 (재시도)

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

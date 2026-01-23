# NetworkingLabRecovery Button Flows

각 버튼별 작동 조건과 실행 내용을 정리한 문서입니다.

---

## 📌 Quick / Normal Reset Buttons

### 1. Router Quick Reset
| 항목 | 내용 |
|------|------|
| **작동 조건** | `Password:` 프롬프트가 보일 때 클릭 |
| **용도** | 비밀번호가 설정된 장비 리셋 |
| **테스트 비밀번호** | `cisco` → `class` |

**Flow:**
```
Password: → cisco/class 시도 → enable → Router# → write erase → [confirm] → reload → 완료
```

---

### 2. Router Quick Reset V2
| 항목 | 내용 |
|------|------|
| **작동 조건** | `Router>` 프롬프트가 보일 때 클릭 |
| **용도** | 비밀번호가 없는 장비 리셋 |
| **비밀번호** | 없음 (enable secret 미설정) |

**Flow:**
```
Router> → en → Router# → wr → wr er → [confirm] → "Erase of nvram: complete" → Router# → reload → 완료
```

---

### 3. Switch Quick Reset
| 항목 | 내용 |
|------|------|
| **작동 조건** | 연결된 상태에서 클릭 |
| **용도** | 스위치 설정 + VLAN 정보 초기화 |
| **테스트 비밀번호** | `cisco` → `class` |

**Flow:**
```
enable → Router#/Switch# → write erase → [confirm] → delete vlan.dat → reload → 완료
```

---

## ⚠️ Password Recovery / Factory Reset Buttons

### 4. Router Recovery (ROMMON)
| 항목 | 내용 |
|------|------|
| **작동 조건** | `rommon 1 >` 프롬프트가 보일 때 클릭 |
| **용도** | 비밀번호를 모르는 라우터 복구 |
| **필요 조건** | ROMMON 모드 진입 필요 (부팅 중 Break 키) |

**Flow:**
```
rommon 1 > → confreg 0x2142 → rommon 2 > → reset → (리부팅, 5-10분 대기)
→ Router> → enable → Router# → write erase → [confirm]
→ conf t → config-register 0x2102 → end → reload → 완료
```

---

### 5. Switch Reset (Boot Mode)
| 항목 | 내용 |
|------|------|
| **작동 조건** | `switch:` 프롬프트가 보일 때 클릭 |
| **용도** | 비밀번호를 모르는 스위치 복구 |
| **필요 조건** | Boot Mode 진입 필요 (부팅 중 Mode 버튼) |

**Flow:**
```
switch: → flash_init → delete flash:vlan.dat → y
→ delete flash:config.text → y → delete flash:private-config.text → y
→ reset → 완료
```

---

### 6. 9200 Recovery
| 항목 | 내용 |
|------|------|
| **작동 조건** | 9200 시리즈 Boot Mode에서 클릭 |
| **용도** | Catalyst 9200 스위치 복구 |

**Flow:**
```
SWITCH_IGNORE_STARTUP_CFG=1 → boot → (부팅, 5-10분 대기)
→ enable → Switch# → write erase → [confirm]
→ conf t → no system ignore startupconfig switch all → exit
→ write memory → reload → 완료
```

---

## 🔧 Utility Buttons

### 7. Test Connection
| 항목 | 내용 |
|------|------|
| **작동 조건** | 시리얼 포트 연결 후 클릭 |
| **용도** | 장비 연결 상태 테스트 |

**Flow:**
```
(빈 Enter 전송) → 응답 대기 → 프롬프트 확인 (Router>, Router#, Switch> 등)
```

---

### 8. Set Test Passwords
| 항목 | 내용 |
|------|------|
| **작동 조건** | 장비가 프롬프트 상태일 때 클릭 |
| **용도** | 테스트용 비밀번호 설정 |
| **설정값** | enable secret: `class`, console password: `cisco` |

**Flow:**
```
enable → conf t → enable secret class → line con 0 → password cisco → login → end → write memory
```

---

## 📋 버튼 선택 가이드

| 현재 상태 | 사용할 버튼 |
|-----------|-------------|
| `Password:` 프롬프트 | Router Quick Reset |
| `Router>` 프롬프트 (비번 없음) | Router Quick Reset V2 |
| `rommon 1 >` 프롬프트 | Router Recovery |
| `switch:` 프롬프트 | Switch Reset |
| 9200 Boot Mode | 9200 Recovery |
| 일반 연결 상태 | Switch Quick Reset |

// ==========================================
// PROMPT PATTERN DETECTION HELPERS
// ==========================================
// Get the last line from the buffer (where prompts typically appear)
function getLastLine(buffer) {
  if (!buffer) return '';
  const lines = buffer.split('\n');
  // Return last non-empty line
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line) return line;
  }
  return '';
}

// Check if buffer shows user mode prompt (ending with >)
// Matches: Router>, R1>, Core-SW>, S1>, etc.
function isUserMode(buffer) {
  const lastLine = getLastLine(buffer);
  // Pattern: any non-whitespace characters followed by >
  return /\S+>\s*$/.test(lastLine);
}

// Check if buffer shows privileged mode prompt (ending with #)
// Matches: Router#, R1#, Core-SW#, S1#, etc.
function isPrivMode(buffer) {
  const lastLine = getLastLine(buffer);
  // Pattern: any non-whitespace characters followed by #
  // But NOT config mode (which has parentheses)
  return /\S+#\s*$/.test(lastLine) && !lastLine.includes('(');
}

// Check if buffer shows config mode prompt
// Matches: (config)#, (config-line)#, (config-if)#, etc.
function isConfigMode(buffer) {
  const lastLine = getLastLine(buffer);
  return /\(config[^)]*\)#\s*$/.test(lastLine);
}

// Check if buffer shows any CLI prompt (> or #)
function isAnyPrompt(buffer) {
  return isUserMode(buffer) || isPrivMode(buffer) || isConfigMode(buffer);
}

// Wait for a specific prompt pattern
// type: 'user' (>), 'priv' (#), 'config' ((config)#), 'any' (> or #)
async function waitForPromptPattern(type, timeoutSec = 30, options = {}) {
  const typeNames = { user: 'User Mode (>)', priv: 'Privileged Mode (#)', config: 'Config Mode', any: 'Any Prompt (> or #)' };
  term.write(`\r\n[SCRIPT] Waiting for: ${typeNames[type] || type}...\r\n`);

  const start = Date.now();
  let lastKeepAlive = Date.now();
  const keepAliveInterval = options.keepAliveInterval || 2000;
  const keepAliveCmd = options.keepAliveCmd || "";

  while (Date.now() - start < timeoutSec * 1000) {
    let found = false;
    if (type === 'user' && isUserMode(globalBuffer)) found = true;
    else if (type === 'priv' && isPrivMode(globalBuffer)) found = true;
    else if (type === 'config' && isConfigMode(globalBuffer)) found = true;
    else if (type === 'any' && isAnyPrompt(globalBuffer)) found = true;

    if (found) {
      const promptText = getLastLine(globalBuffer);
      term.write(`\r\n[SCRIPT] ✓ Detected: "${promptText}"\r\n`);
      return true;
    }

    if (options.sendKeepAlive && (Date.now() - lastKeepAlive > keepAliveInterval)) {
      await sendCmd(keepAliveCmd);
      lastKeepAlive = Date.now();
    }

    await new Promise(r => setTimeout(r, 100));
  }

  term.write(`\r\n[SCRIPT] ✗ Timeout waiting for ${typeNames[type]}.\r\n`);
  return false;
}

// Enhanced waitForAny that supports both exact strings and our new prompt patterns
// Special patterns: ':user_mode:', ':priv_mode:', ':config_mode:', ':any_prompt:'
async function waitForAnyEnhanced(patterns, timeoutSec = 30, options = {}) {
  const patternStr = patterns.map((p) => `"${p}"`).join(" or ");
  term.write(`\r\n[SCRIPT] Waiting for: ${patternStr}...\r\n`);

  const start = Date.now();
  let lastKeepAlive = Date.now();
  const keepAliveInterval = options.keepAliveInterval || 2000;
  const keepAliveCmd = options.keepAliveCmd || "";

  while (Date.now() - start < timeoutSec * 1000) {
    // Check pattern-based prompts first
    for (let p of patterns) {
      if (p === ':user_mode:' && isUserMode(globalBuffer)) {
        const promptText = getLastLine(globalBuffer);
        term.write(`\r\n[SCRIPT] ✓ Detected user mode prompt: "${promptText}"\r\n`);
        return { match: ':user_mode:', index: 0 };
      }
      if (p === ':priv_mode:' && isPrivMode(globalBuffer)) {
        const promptText = getLastLine(globalBuffer);
        term.write(`\r\n[SCRIPT] ✓ Detected priv mode prompt: "${promptText}"\r\n`);
        return { match: ':priv_mode:', index: 0 };
      }
      if (p === ':config_mode:' && isConfigMode(globalBuffer)) {
        const promptText = getLastLine(globalBuffer);
        term.write(`\r\n[SCRIPT] ✓ Detected config mode prompt: "${promptText}"\r\n`);
        return { match: ':config_mode:', index: 0 };
      }
      if (p === ':any_prompt:' && isAnyPrompt(globalBuffer)) {
        const promptText = getLastLine(globalBuffer);
        term.write(`\r\n[SCRIPT] ✓ Detected prompt: "${promptText}"\r\n`);
        return { match: ':any_prompt:', index: 0 };
      }
    }

    // Check exact string matches
    for (let p of patterns) {
      if (!p.startsWith(':')) {
        const idx = globalBuffer.indexOf(p);
        if (idx !== -1) {
          globalBuffer = globalBuffer.substring(idx + p.length);
          term.write(`\r\n[SCRIPT] ✓ Found: "${p}"\r\n`);
          return { match: p, index: idx };
        }
      }
    }

    if (options.sendKeepAlive && (Date.now() - lastKeepAlive > keepAliveInterval)) {
      await sendCmd(keepAliveCmd);
      lastKeepAlive = Date.now();
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  term.write("\r\n[SCRIPT] ✗ Timeout waiting for any pattern.\r\n");
  return null;
}

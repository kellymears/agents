#!/usr/bin/env node
// seniordev — UserPromptSubmit hook to track which seniordev mode is active
// Inspects user input for /seniordev commands and writes mode to flag file

const { getDefaultMode } = require('./seniordev-config');
const { clearMode, setMode, writeHookOutput } = require('./seniordev-runtime');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Match /seniordev commands
    if (/^[/@$]seniordev/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/seniordev-review' || cmd === '/seniordev:seniordev-review') {
        mode = 'review';
      } else if (cmd === '/seniordev' || cmd === '/seniordev:seniordev') {
        if (arg === 'lite') mode = 'lite';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off') mode = 'off';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'SENIORDEV MODE CHANGED — level: ' + mode,
        );
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'SENIORDEV MODE OFF');
      }
    }

    // Detect deactivation
    if (/\b(stop seniordev|normal mode)\b/i.test(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'SENIORDEV MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});

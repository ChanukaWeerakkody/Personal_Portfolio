import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCommand,
  validateAndSanitizeCommand,
  executeChatCommand,
  COMMAND_FALLBACK,
  CHAT_COMMANDS,
} from '@/lib/assistant';

describe('Chatbot Command Registry and Handling', () => {
  it('identifies commands accurately', () => {
    assert.equal(isCommand('/help'), true);
    assert.equal(isCommand('  /skills  '), true);
    assert.equal(isCommand('/unknown'), true);
    assert.equal(isCommand('what is your stack?'), false);
    assert.equal(isCommand(''), false);
    assert.equal(isCommand(null), false);
    assert.equal(isCommand(undefined), false);
  });

  it('validates supported commands in the registry', () => {
    const supported = [
      'help',
      'about',
      'skills',
      'projects',
      'architecture',
      'experience',
      'writing',
      'github',
      'contact',
      'clear',
    ];

    for (const cmd of supported) {
      const res = validateAndSanitizeCommand(`/${cmd}`);
      assert.equal(res.valid, true, `Expected /${cmd} to be valid`);
      assert.equal(res.name, cmd);
    }
  });

  it('resolves supported aliases to their canonical commands', () => {
    const aliasMap = {
      '/?': 'help',
      '/bio': 'about',
      '/intro': 'about',
      '/journey': 'experience',
      '/timeline': 'experience',
      '/stack': 'skills',
      '/tech': 'skills',
      '/work': 'projects',
      '/articles': 'writing',
      '/blogs': 'writing',
      '/blog': 'writing',
      '/hire': 'contact',
      '/email': 'contact',
    };

    for (const [alias, canonical] of Object.entries(aliasMap)) {
      const res = validateAndSanitizeCommand(alias);
      assert.equal(res.valid, true, `Expected alias ${alias} to resolve`);
      assert.equal(res.name, canonical);
    }
  });

  it('safely handles empty, malformed, unknown, and unsupported commands', async () => {
    const invalidInputs = [
      '/',
      '///',
      '/   ',
      '/unknownCommand123',
      '/rm -rf /',
      '/@#$%^',
      '',
      null,
      undefined,
      123,
      {},
    ];

    for (const input of invalidInputs) {
      const res = await executeChatCommand(input);
      assert.equal(res.success, false, `Expected failure for input: ${input}`);
      assert.equal(
        res.text,
        COMMAND_FALLBACK,
        `Expected fallback message for input: ${input}`
      );
      assert.equal(
        res.text,
        "Command not recognized. Type '/help' for available options."
      );
    }
  });

  it('executes valid commands and returns grounded responses', async () => {
    const helpRes = await executeChatCommand('/help');
    assert.equal(helpRes.success, true);
    assert.match(helpRes.text, /Available commands:/);
    assert.match(helpRes.text, /\/help/);
    assert.match(helpRes.text, /\/skills/);

    const skillsRes = await executeChatCommand('/skills');
    assert.equal(skillsRes.success, true);
    assert.equal(skillsRes.section, 'skills');
    assert.match(skillsRes.text, /Spring Boot/);

    const projectsRes = await executeChatCommand('/projects');
    assert.equal(projectsRes.success, true);
    assert.equal(projectsRes.section, 'projects');

    const archRes = await executeChatCommand('/architecture');
    assert.equal(archRes.success, true);
    assert.equal(archRes.section, 'architecture');

    const clearRes = await executeChatCommand('/clear');
    assert.equal(clearRes.success, true);
    assert.equal(clearRes.action, 'clear');
  });

  it('safely catches and recovers when command execution throws', async () => {
    // Temporarily add a faulty command
    CHAT_COMMANDS.faulty = {
      name: 'faulty',
      execute: () => {
        throw new Error('Unexpected crash in command executor');
      },
    };

    const res = await executeChatCommand('/faulty');
    assert.equal(res.success, false);
    assert.equal(
      res.text,
      "Command not recognized. Type '/help' for available options."
    );

    // Clean up
    delete CHAT_COMMANDS.faulty;
  });

  it('never appends invalid or failed responses as successful results', async () => {
    const failedRes = await executeChatCommand('/invalidCmd');
    assert.equal(failedRes.success, false);
    assert.equal(failedRes.section, undefined);

    // Simulated conversation history state
    const history = [
      { role: 'bot', text: 'Greeting' },
      { role: 'user', text: 'Hello' },
    ];

    const currentHistory = [...history];
    const userMessage = { role: 'user', text: '/invalidCmd' };

    // Processing failure safely preserves conversation history
    const botResponseText = (failedRes.success && failedRes.text)
      ? failedRes.text
      : COMMAND_FALLBACK;

    const updatedHistory = [
      ...currentHistory,
      userMessage,
      {
        role: 'bot',
        text: botResponseText,
        section: failedRes.success ? failedRes.section : null,
        source: failedRes.success ? 'command' : 'system',
      },
    ];

    assert.equal(updatedHistory.length, 4);
    assert.equal(updatedHistory[0].text, 'Greeting');
    assert.equal(updatedHistory[1].text, 'Hello');
    assert.equal(updatedHistory[2].text, '/invalidCmd');
    assert.equal(updatedHistory[3].text, COMMAND_FALLBACK);
    assert.equal(updatedHistory[3].section, null);
    assert.equal(updatedHistory[3].source, 'system');
  });
});


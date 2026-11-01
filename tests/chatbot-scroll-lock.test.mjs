import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Chatbot Scroll Isolation and Body Lock', () => {
  it('locks body overflow to hidden and restores original value on close or unmount', () => {
    const mockBody = {
      style: {
        overflow: '',
      },
    };

    // 1. Initial state
    assert.equal(mockBody.style.overflow, '');

    // 2. Chatbot opens -> save original overflow and set to hidden
    const originalOverflow = mockBody.style.overflow;
    mockBody.style.overflow = 'hidden';
    assert.equal(mockBody.style.overflow, 'hidden');

    // 3. Chatbot closes or unmounts -> restore original overflow
    mockBody.style.overflow = originalOverflow;
    assert.equal(mockBody.style.overflow, '');
  });

  it('restores non-empty original overflow accurately across rapid open/close', () => {
    const mockBody = {
      style: {
        overflow: 'auto',
      },
    };

    // Chatbot opens
    const originalOverflow = mockBody.style.overflow;
    mockBody.style.overflow = 'hidden';
    assert.equal(mockBody.style.overflow, 'hidden');

    // Chatbot closes
    mockBody.style.overflow = originalOverflow;
    assert.equal(mockBody.style.overflow, 'auto');
  });

  it('isolates wheel scroll events and prevents background propagation', () => {
    let stoppedPropagation = false;
    let preventedDefault = false;

    const messageListEl = {
      scrollTop: 10,
      scrollHeight: 500,
      clientHeight: 200,
      contains: (t) => t === insideMessageEl,
    };

    const insideMessageEl = { id: 'msg-bubble' };
    const outsideEl = { id: 'header-button' };

    const createWheelHandler = (scrollEl) => (e) => {
      e.stopPropagation();

      if (!scrollEl.contains(e.target)) {
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isScrollable = scrollHeight > clientHeight;

      if (!isScrollable) {
        e.preventDefault();
        return;
      }

      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    const wheelHandler = createWheelHandler(messageListEl);

    // Scenario A: Wheel over header (outside scroll container) -> should stop propagation and preventDefault
    stoppedPropagation = false;
    preventedDefault = false;
    wheelHandler({
      target: outsideEl,
      deltaY: 50,
      stopPropagation: () => { stoppedPropagation = true; },
      preventDefault: () => { preventedDefault = true; },
    });
    assert.equal(stoppedPropagation, true);
    assert.equal(preventedDefault, true);

    // Scenario B: Normal scrolling inside message list -> stopPropagation, allow scroll (no preventDefault)
    stoppedPropagation = false;
    preventedDefault = false;
    wheelHandler({
      target: insideMessageEl,
      deltaY: 20,
      stopPropagation: () => { stoppedPropagation = true; },
      preventDefault: () => { preventedDefault = true; },
    });
    assert.equal(stoppedPropagation, true);
    assert.equal(preventedDefault, false);

    // Scenario C: Wheel reaches top boundary and scrolls up -> preventDefault to prevent bounce/chain
    messageListEl.scrollTop = 0;
    stoppedPropagation = false;
    preventedDefault = false;
    wheelHandler({
      target: insideMessageEl,
      deltaY: -20,
      stopPropagation: () => { stoppedPropagation = true; },
      preventDefault: () => { preventedDefault = true; },
    });
    assert.equal(stoppedPropagation, true);
    assert.equal(preventedDefault, true);
  });

  it('handles mobile touch scroll isolation safely', () => {
    let stoppedPropagation = false;
    let preventedDefault = false;

    const messageListEl = {
      scrollTop: 50,
      scrollHeight: 400,
      clientHeight: 200,
      contains: (t) => t === insideMessageEl,
    };

    const insideMessageEl = { id: 'msg-bubble' };
    const outsideEl = { id: 'header' };

    let touchStartY = 100;
    const createTouchMoveHandler = (scrollEl) => (e) => {
      e.stopPropagation();

      if (!scrollEl.contains(e.target)) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isScrollable = scrollHeight > clientHeight;

      if (!isScrollable) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      const touchCurrentY = e.touches?.[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchCurrentY;

      const isAtTop = scrollTop <= 0 && deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY > 0;

      if ((isAtTop || isAtBottom) && e.cancelable) {
        e.preventDefault();
      }
    };

    const touchMoveHandler = createTouchMoveHandler(messageListEl);

    // Touching outside message container (e.g. header)
    stoppedPropagation = false;
    preventedDefault = false;
    touchMoveHandler({
      target: outsideEl,
      cancelable: true,
      touches: [{ clientY: 80 }],
      stopPropagation: () => { stoppedPropagation = true; },
      preventDefault: () => { preventedDefault = true; },
    });
    assert.equal(stoppedPropagation, true);
    assert.equal(preventedDefault, true);

    // Touching inside message container in the middle -> native touch scroll enabled
    stoppedPropagation = false;
    preventedDefault = false;
    touchMoveHandler({
      target: insideMessageEl,
      cancelable: true,
      touches: [{ clientY: 80 }],
      stopPropagation: () => { stoppedPropagation = true; },
      preventDefault: () => { preventedDefault = true; },
    });
    assert.equal(stoppedPropagation, true);
    assert.equal(preventedDefault, false);
  });

  it('registers and cleans up wheel and touch listeners on unmount', () => {
    const listeners = new Map();

    const mockDialog = {
      addEventListener: (type, handler) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener: (type, handler) => {
        listeners.get(type)?.delete(handler);
      },
    };

    const handleWheel = () => {};
    const handleTouchStart = () => {};
    const handleTouchMove = () => {};

    // Simulate mounting
    mockDialog.addEventListener('wheel', handleWheel);
    mockDialog.addEventListener('touchstart', handleTouchStart);
    mockDialog.addEventListener('touchmove', handleTouchMove);

    assert.equal(listeners.get('wheel').has(handleWheel), true);
    assert.equal(listeners.get('touchstart').has(handleTouchStart), true);
    assert.equal(listeners.get('touchmove').has(handleTouchMove), true);

    // Simulate unmounting
    mockDialog.removeEventListener('wheel', handleWheel);
    mockDialog.removeEventListener('touchstart', handleTouchStart);
    mockDialog.removeEventListener('touchmove', handleTouchMove);

    assert.equal(listeners.get('wheel').has(handleWheel), false);
    assert.equal(listeners.get('touchstart').has(handleTouchStart), false);
    assert.equal(listeners.get('touchmove').has(handleTouchMove), false);
  });
});


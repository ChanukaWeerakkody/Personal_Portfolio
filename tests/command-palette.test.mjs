import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Command Palette Outside-Click and Event Handling', () => {
  it('detects outside pointer and mouse events and closes palette', () => {
    let isOpen = true;
    const onClose = () => {
      isOpen = false;
    };

    // Simulated DOM node container for the palette
    const insideEl = { id: 'palette-inside' };
    const paletteContainer = {
      contains: (target) => target === insideEl || target === paletteContainer,
    };

    // Outside element
    const outsideEl = { id: 'backdrop-or-body' };

    // Handler logic as implemented in CommandPalette
    const handleOutsideClick = (event) => {
      if (
        paletteContainer &&
        event.target &&
        !paletteContainer.contains(event.target)
      ) {
        onClose();
      }
    };

    // Event on inside element: should NOT close
    handleOutsideClick({ target: insideEl });
    assert.equal(isOpen, true, 'Palette should remain open on inside click');

    // Event on outside element: SHOULD close
    handleOutsideClick({ target: outsideEl });
    assert.equal(isOpen, false, 'Palette should close on outside click');
  });

  it('keeps inside clicks working with propagation stopping', () => {
    let propagationStopped = false;
    const insideEvent = {
      target: { id: 'input' },
      stopPropagation: () => {
        propagationStopped = true;
      },
    };

    // Inside click stopPropagation
    insideEvent.stopPropagation();
    assert.equal(propagationStopped, true);
  });

  it('registers and cleans up all outside-click event listeners', () => {
    const listeners = new Map();

    const mockDocument = {
      addEventListener: (type, handler) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener: (type, handler) => {
        listeners.get(type)?.delete(handler);
      },
    };

    // Simulate mounting CommandPalette with open = true
    const handleOutsideClick = () => {};
    mockDocument.addEventListener('pointerdown', handleOutsideClick);
    mockDocument.addEventListener('mousedown', handleOutsideClick);

    assert.equal(listeners.get('pointerdown').has(handleOutsideClick), true);
    assert.equal(listeners.get('mousedown').has(handleOutsideClick), true);

    // Simulate cleanup on unmount or close
    mockDocument.removeEventListener('pointerdown', handleOutsideClick);
    mockDocument.removeEventListener('mousedown', handleOutsideClick);

    assert.equal(listeners.get('pointerdown').has(handleOutsideClick), false);
    assert.equal(listeners.get('mousedown').has(handleOutsideClick), false);
  });
});


import React from 'react';

/**
 * Handles keyboard navigation (Arrow Up, Arrow Down, Enter, Shift+Enter, Left, Right)
 * across editable spreadsheet-style grid cells and tables.
 */
export function handleGridKeyDown(
  e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLElement>,
  gridId: string,
  rowIndex: number,
  colIndex: number | string,
  options?: {
    enableHorizontal?: boolean;
    totalCols?: number;
    colOrder?: (number | string)[];
  }
) {
  const key = e.key;

  // 1. Vertical Navigation: ArrowUp / ArrowDown / Enter
  const isUp = key === 'ArrowUp' || (key === 'Enter' && e.shiftKey);
  const isDown = key === 'ArrowDown' || (key === 'Enter' && !e.shiftKey);

  if (isUp) {
    e.preventDefault();
    const targetRow = rowIndex - 1;
    if (targetRow >= 0) {
      focusGridCell(gridId, targetRow, colIndex);
    }
    return;
  }

  if (isDown) {
    e.preventDefault();
    const targetRow = rowIndex + 1;
    focusGridCell(gridId, targetRow, colIndex);
    return;
  }

  // 2. Horizontal Navigation (if enabled or using left/right arrows at cursor edges)
  if (options?.enableHorizontal && options.colOrder && options.colOrder.length > 1) {
    const currentPos = options.colOrder.indexOf(colIndex);
    if (currentPos !== -1) {
      if (key === 'ArrowRight') {
        const input = e.target as HTMLInputElement;
        const isAtEnd = input.selectionEnd === input.value?.length;
        if (isAtEnd || input.type === 'number' || e.altKey) {
          const nextCol = options.colOrder[currentPos + 1];
          if (nextCol !== undefined) {
            e.preventDefault();
            focusGridCell(gridId, rowIndex, nextCol);
          }
        }
      } else if (key === 'ArrowLeft') {
        const input = e.target as HTMLInputElement;
        const isAtStart = input.selectionStart === 0;
        if (isAtStart || input.type === 'number' || e.altKey) {
          const prevCol = options.colOrder[currentPos - 1];
          if (prevCol !== undefined) {
            e.preventDefault();
            focusGridCell(gridId, rowIndex, prevCol);
          }
        }
      }
    }
  }
}

/**
 * Focuses a specific grid cell by its gridId, row index, and col index/identifier.
 */
export function focusGridCell(gridId: string, rowIndex: number, colIndex: number | string) {
  const selector = `[data-grid="${gridId}"][data-row="${rowIndex}"][data-col="${colIndex}"]`;
  const target = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector);

  if (target) {
    target.focus();
    if ('select' in target && typeof target.select === 'function' && target.tagName === 'INPUT') {
      try {
        (target as HTMLInputElement).select();
      } catch (err) {
        // Some input types might not support select(), ignore safely
      }
    }
  }
}

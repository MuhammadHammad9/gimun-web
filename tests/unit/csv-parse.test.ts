import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../src/lib/csv';

describe('reading CSV exports', () => {
  it('reads a Google Forms export with quotes, commas and line breaks', () => {
    const text = '﻿Timestamp,Full name,Email,Why\r\n2026/10/01,"Khan, Ali",ali@example.test,"Loves ""debate""\nand law"\r\n\r\n2026/10/02,Sara,sara@example.test,\r\n';
    expect(parseCsv(text)).toEqual([
      ['Timestamp', 'Full name', 'Email', 'Why'],
      ['2026/10/01', 'Khan, Ali', 'ali@example.test', 'Loves "debate"\nand law'],
      ['2026/10/02', 'Sara', 'sara@example.test', ''],
    ]);
  });
  it('handles a file without a final line break', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

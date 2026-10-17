import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { can, canEvent, canPurge, coversBothEvents, eventsOf, type AdminUser } from '../../src/lib/server/admin/permissions';
import { eventOfEntry, eventOfReference, scopeEvent } from '../../src/lib/server/admin/scope';

const user = (role: AdminUser['role'], events?: AdminUser['events']): AdminUser => ({ user_id: 'u', email: 'e', display_name: 'd', role, sections: [], active: true, must_change_password: false, events });

/** Records the filters a query receives. */
function recorder() {
  const calls: string[] = [];
  const q = { or(f: string) { calls.push(`or:${f}`); return q; }, eq(c: string, v: string) { calls.push(`eq:${c}=${v}`); return q; } };
  return { q, calls };
}

describe('event scope', () => {
  it('gives owners both events whatever is stored', () => {
    expect(eventsOf(user('owner', ['gimun']))).toEqual(['gimun', 'moot-cup']);
  });
  it('treats a profile without a scope column as both events', () => {
    expect(coversBothEvents(user('registrar'))).toBe(true);
  });
  it('limits a one-event admin to that event and shared records', () => {
    const gimun = user('registrar', ['gimun']);
    expect(canEvent(gimun, 'gimun')).toBe(true);
    expect(canEvent(gimun, 'moot-cup')).toBe(false);
    expect(canEvent(gimun, null)).toBe(true);
  });
  it('hides sections that belong to the other event', () => {
    expect(can(user('editor', ['moot-cup']), 'committees')).toBe(false);
    expect(can(user('editor', ['moot-cup']), 'moot-categories', true)).toBe(true);
    expect(can(user('registrar', ['moot-cup']), 'allocations')).toBe(false);
    expect(can(user('registrar', ['gimun']), 'allocations', true)).toBe(true);
  });
  it('keeps site settings writes for admins of both events', () => {
    expect(can(user('admin', ['gimun']), 'settings')).toBe(true);
    expect(can(user('admin', ['gimun']), 'settings', true)).toBe(false);
    expect(can(user('admin'), 'settings', true)).toBe(true);
  });
  it('lets owners and in-scope admins delete permanently, nobody else', () => {
    expect(canPurge(user('owner'), 'team', null)).toBe(true);
    expect(canPurge(user('admin', ['gimun']), 'schedule', 'gimun')).toBe(true);
    expect(canPurge(user('admin', ['gimun']), 'schedule', 'moot-cup')).toBe(false);
    expect(canPurge(user('admin', ['gimun']), 'team', null)).toBe(false);
    expect(canPurge(user('admin'), 'team', null)).toBe(true);
    expect(canPurge(user('editor'), 'team', null)).toBe(false);
  });
});

describe('which event a record belongs to', () => {
  it('reads references', () => {
    expect(eventOfReference('REG-GIMUN-2026-0001')).toBe('gimun');
    expect(eventOfReference('REG-MOOT-2026-0001')).toBe('moot-cup');
    expect(eventOfReference('INQ-1')).toBeNull();
  });
  it('reads content entries like content_event() in SQL', () => {
    expect(eventOfEntry('committees', {})).toBe('gimun');
    expect(eventOfEntry('moot-categories', {})).toBe('moot-cup');
    expect(eventOfEntry('schedule', { track: 'moot-cup' })).toBe('moot-cup');
    expect(eventOfEntry('schedule', { track: 'shared' })).toBeNull();
    expect(eventOfEntry('team', {})).toBeNull();
    const sql = readFileSync('supabase/migrations/0015_event_scope.sql', 'utf8');
    expect(sql).toMatch(/p_collection = 'committees' then 'gimun'/);
    expect(sql).toMatch(/p_collection in \('moot-categories', 'clarifications'\) then 'moot-cup'/);
  });
});

describe('query scoping', () => {
  it('leaves queries alone for admins of both events', () => {
    const { q, calls } = recorder();
    scopeEvent(q, user('registrar'));
    expect(calls).toEqual([]);
  });
  it('keeps shared rows and drops the other event', () => {
    const { q, calls } = recorder();
    scopeEvent(q, user('registrar', ['gimun']), 'data->>track');
    expect(calls).toEqual(['or:data->>track.is.null,data->>track.neq.moot-cup']);
  });
  it('matches the event exactly for records that always have one', () => {
    const { q, calls } = recorder();
    scopeEvent(q, user('checkin', ['moot-cup']), 'track', false);
    expect(calls).toEqual(['eq:track=moot-cup']);
  });
});

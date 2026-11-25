import { createHmac } from 'crypto';
import { validSlackRequest, isFullWorkspaceMember } from './release-auth';

const raw = Buffer.from('{"event_id":"Ev1"}');
const now = 1770000000;
const signature = 'v0=' + createHmac('sha256', 'test-secret').update('v0:' + now + ':').update(raw).digest('hex');

it('accepts the signed raw bytes only within five minutes', () => {
  expect(validSlackRequest(raw, String(now), signature, 'test-secret', now)).toBe(true);
  expect(validSlackRequest(Buffer.from('different'), String(now), signature, 'test-secret', now)).toBe(false);
  expect(validSlackRequest(raw, String(now), signature, 'test-secret', now + 301)).toBe(false);
  expect(validSlackRequest(raw, String(now), signature, '', now)).toBe(false);
});

it('admits active full members of the exact workspace', () => {
  const member = { id: 'U1', team_id: 'T1', deleted: false, is_bot: false, is_restricted: false, is_ultra_restricted: false };
  expect(isFullWorkspaceMember(member, 'T1', 'U1')).toBe(true);
  for (const overrides of [{team_id:'T2'}, {deleted:true}, {is_bot:true}, {is_restricted:true}, {is_ultra_restricted:true}, {is_stranger:true}, {id:'USLACKBOT'}])
    expect(isFullWorkspaceMember({...member,...overrides}, 'T1', 'U1')).toBe(false);
  expect(isFullWorkspaceMember(undefined, 'T1', 'U1')).toBe(false);
});

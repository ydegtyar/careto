import { describe, expect, it } from 'vitest';
import { HLC } from './hlc';

describe('HLC (Hybrid Logical Clock)', () => {
  it('generates strictly monotonic clocks on repeated calls', () => {
    const hlc = new HLC('node-a');
    const t1 = hlc.now();
    const t2 = hlc.now();
    const t3 = hlc.now();

    expect(HLC.compare(t1, t2)).toBeLessThan(0);
    expect(HLC.compare(t2, t3)).toBeLessThan(0);
    expect(HLC.compare(t3, t1)).toBeGreaterThan(0);
    expect(HLC.compare(t1, t1)).toBe(0);
  });

  it('advances clock upon receiving remote message with higher timestamp', () => {
    const local = new HLC('node-a');
    const remote = new HLC('node-b');

    const remoteTime = remote.now();
    const localBefore = local.now();

    const localAfter = local.recv(remoteTime);

    expect(HLC.compare(localAfter, remoteTime)).toBeGreaterThan(0);
    expect(HLC.compare(localAfter, localBefore)).toBeGreaterThan(0);
  });

  it('clamps excessive future timestamps from remote clock drift to <= now + 5 min', () => {
    const local = new HLC('node-a');
    const physNow = Date.now();

    // Fabricate an insane remote timestamp: 1 hour in the future
    const oneHourFuture = physNow + 3600 * 1000;
    const driftedHlc = `${oneHourFuture.toString(36)}-0-node-drift`;

    const received = local.recv(driftedHlc);
    const receivedWall = parseInt(received.split('-')[0]!, 36);

    const maxAllowedFuture = physNow + 5 * 60 * 1000 + 100; // tolerance
    expect(receivedWall).toBeLessThanOrEqual(maxAllowedFuture);
  });

  it('accurately orders HLCs comparing wall time, logical counter, and node id', () => {
    const a = '1000-0-a';
    const b = '1000-1-a';
    const c = '1000-1-b';
    const d = '1001-0-a';

    expect(HLC.compare(a, b)).toBeLessThan(0);
    expect(HLC.compare(b, c)).toBeLessThan(0);
    expect(HLC.compare(c, d)).toBeLessThan(0);
  });
});

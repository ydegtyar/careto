export class HLC {
  private wall: number;
  private count: number;
  private readonly nodeId: string;

  constructor(nodeId?: string) {
    this.wall = Date.now();
    this.count = 0;
    this.nodeId = nodeId ?? Math.random().toString(36).substring(2, 8);
  }

  public now(): string {
    const phys = Date.now();
    if (phys > this.wall) {
      this.wall = phys;
      this.count = 0;
    } else {
      this.count++;
    }
    return `${this.wall.toString(36)}-${this.count.toString(36)}-${this.nodeId}`;
  }

  public recv(remoteHlc: string): string {
    const parts = remoteHlc.split('-');
    const rWall = parseInt(parts[0] ?? '0', 36);
    const rCount = parseInt(parts[1] ?? '0', 36);
    const phys = Date.now();

    // Guard against excessive future clock drift (> now + 5 min)
    const maxAllowedFuture = phys + 5 * 60 * 1000;
    const effectiveRWall = Math.min(rWall, maxAllowedFuture);

    const maxWall = Math.max(phys, this.wall, effectiveRWall);
    if (maxWall === this.wall && maxWall === effectiveRWall) {
      this.count = Math.max(this.count, rCount) + 1;
    } else if (maxWall === this.wall) {
      this.count++;
    } else if (maxWall === effectiveRWall) {
      this.count = rCount + 1;
    } else {
      this.count = 0;
    }
    this.wall = maxWall;

    return `${this.wall.toString(36)}-${this.count.toString(36)}-${this.nodeId}`;
  }

  public static compare(a: string, b: string): number {
    const [wA = '0', cA = '0', nA = ''] = a.split('-');
    const [wB = '0', cB = '0', nB = ''] = b.split('-');

    const valWA = parseInt(wA, 36);
    const valWB = parseInt(wB, 36);
    if (valWA !== valWB) return valWA - valWB;

    const valCA = parseInt(cA, 36);
    const valCB = parseInt(cB, 36);
    if (valCA !== valCB) return valCA - valCB;

    return nA.localeCompare(nB);
  }
}

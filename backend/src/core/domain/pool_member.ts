export class PoolMember {
  constructor(
    public readonly pool_id: string,
    public readonly ship_id: string,
    public readonly cb_before: number,
    public readonly cb_after: number,
  ) {}
}

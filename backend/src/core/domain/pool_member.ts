export class PoolMember {
  constructor(
    public readonly pool_id: string,
    public readonly ship_id: string,
    public cb_before: number,
    public cb_after: number | null,
  ) {}
}

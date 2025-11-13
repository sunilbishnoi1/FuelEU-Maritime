# AI Agent Workflow Log
## Agents Used
- **GitHub Copilot**: 
- **Gemini CLI**: 
---

### Prompt 1:
**Tool:**  Gemini CLI

**Prompt:** Create a hexagonal architecture folder structure for a Node.js TypeScript backend with:
    src/
    core/
        domain/
        application/
        ports/
    adapters/
        inbound/http/
        outbound/postgres/
    infrastructure/
        db/
        server/
    shared/



**Output:** [Generated folder structure]

**Validation/Corrections:**
- verified the folder structure and it was good to start

---
### Prompt 2: 
**Tool:** Github Copilot Agent

**Prompt:** need to write the compliance balance calculation. target intensity is 89.3368 for 2025 and the formula is CB = (Target - Actual) × Energy in scope where energy = fuel consumption × 41000. how do i structure this in the service to calculate cb.


**Output:**
```
typescript
async getComplianceBalance(
  shipId: string,
  year: number,
): Promise<Compliance | null> {
  const existingCompliance =
    await this.complianceRepository.findByShipIdAndYear(shipId, year);
  if (existingCompliance) {
    return existingCompliance;
  }

  // This is a simplification. In a real scenario, we'd have a way to get the route for a ship.
  // Here we assume the shipId is the route_id.
  const route = await this.routesRepository.findById(shipId);
  if (!route) {
    return null;
  }

  // Mocked fuel consumption. In a real app, this would come from ship data.
  const fuelConsumption = 1000; // in tonnes
  const energyInScope = fuelConsumption * 41000; // MJ
  const actualIntensity = route.ghg_intensity;

  const complianceBalance =
    (this.targetIntensity2025 - actualIntensity) * energyInScope;

  const newCompliance = new Compliance(
    uuidv4(),
    shipId,
    year,
    complianceBalance,
  );

  return this.complianceRepository.save(newCompliance);
}
```

**Validation/Corrections:**
-   tested with route R001 which has 91.0 intensity and got correct output
---

### Prompt 3: 
**Tool:** Gemini CLI

**Prompt:** my pooling allocation logic is broken. i'm sorting members by CB descending and trying to zero out deficits but the surplus members cbAfter isn't getting reduced correctly. the total surplus used to cover deficits needs to be subtracted from the original surplus contributors but i'm not tracking that properly. here's my current createPool logic in pooling_service.ts - can you suggest how to fix the allocation so surplus reduction works correctly?


**Output:**
To fix the surplus allocation, you need a three-pass approach:

**Pass 1:** Initialize all members with cbBefore = cbAfter and calculate total available surplus
**Pass 2:** Iterate through deficit members and cover their deficits using the total surplus pool, tracking how much surplus is consumed
**Pass 3:** Reduce surplus members' cbAfter based on how much total surplus was actually used

Here's the corrected logic:

```typescript
// First pass: Calculate initial state
for (const member of membersWithCb) {
  membersWithFinalCb.push({ 
    shipId: member.shipId, 
    cbBefore: member.cb, 
    cbAfter: member.cb 
  });
  if (member.cb > 0) {
    totalSurplusAvailable += member.cb;
  }
}

// Second pass: Cover deficits
for (const member of membersWithFinalCb) {
  if (member.cbBefore < 0) {
    const deficitToCover = Math.abs(member.cbBefore);
    if (totalSurplusAvailable >= deficitToCover) {
      member.cbAfter = 0;
      totalSurplusAvailable -= deficitToCover;
    } else {
      member.cbAfter = member.cbBefore + totalSurplusAvailable;
      totalSurplusAvailable = 0;
    }
  }
}

// Third pass: Reduce surplus members proportionally
const initialTotalSurplus = membersWithCb
  .filter(m => m.cb > 0)
  .reduce((sum, m) => sum + m.cb, 0);
let surplusUsed = initialTotalSurplus - totalSurplusAvailable;

if (surplusUsed > 0) {
  for (const member of membersWithFinalCb) {
    if (member.cbBefore > 0 && surplusUsed > 0) {
      const reductionAmount = Math.min(member.cbBefore, surplusUsed);
      member.cbAfter -= reductionAmount;
      surplusUsed -= reductionAmount;
    }
  }
}
```

The key is tracking `surplusUsed` separately and then iterating through surplus members to reduce their cbAfter accordingly.

**Validation/Corrections:**
-   this fixed the allocation but gemini didn't add the validation checks for the FuelEU rules so i had to add those throws myself after the allocation

---

### Prompt 4: 
**Tool:** Github Copilot Agent

**Prompt:** all my postgres repositories in adapters/outbound/postgres/ have business logic mixed in. need to clean them up so they only do data access - no calculations, no validations, just queries and mapping to domain entities. also need consistent error handling. can you refactor routes_repository first then i'll apply the same pattern to the others


**Output:**
I'll refactor the routes repository to focus purely on data access. Here's the cleaned up version:

```typescript
export class PgRoutesRepository implements RoutesRepository {
  async findAll(): Promise<Route[]> {
    try {
      const result = await pool.query('SELECT * FROM routes');
      return result.rows.map(row => this.mapToRoute(row));
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw new Error('Failed to fetch routes');
    }
  }

  async findById(id: string): Promise<Route | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM routes WHERE id = $1',
        [id]
      );
      return result.rows[0] ? this.mapToRoute(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw new Error('Failed to fetch route');
    }
  }

  async setBaseline(id: string): Promise<Route | null> {
    try {
      await pool.query('UPDATE routes SET is_baseline = false');
      const result = await pool.query(
        'UPDATE routes SET is_baseline = true WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] ? this.mapToRoute(result.rows[0]) : null;
    } catch (error) {
      console.error('Error setting baseline:', error);
      throw new Error('Failed to set baseline');
    }
  }

  private mapToRoute(row: any): Route {
    return {
      id: row.id,
      route_id: row.route_id,
      year: row.year,
      ghg_intensity: row.ghg_intensity,
      is_baseline: row.is_baseline
    };
  }
}
```

The key changes:
- Removed all business logic
- Added consistent try-catch error handling
- Created a private mapping method for DRY
- All methods now just query and map to domain entities

**Validation/Corrections:**
- applied same pattern to other repos but had to make another message to agent to add findNonBaselineRoutes method since copilot didn't generate it in first attempt.

---

### Prompt 5: 
**Tool:** Github Copilot Agent
**Prompt:** 


**Output:**
```

```

**Validation/Corrections:**
- 

---

### Prompt 6: 
**Tool:** 
**Prompt:** 


**Output:**
```

```

**Validation/Corrections:**
- 

---
## Observations
-   gemini-cli still has some issues like it get stuck after running cmds like "npm run dev" as it probably has no trigger to understand completion of such open ended commands
-   copilot sometimes gets stuck in errors thats when i need to take over the code and handle issues

---
## Best Practices Followed
-   Whenever using agent mode, i always made sure to review the suggested changes and not set agent on 'allow always (auto)' to ensure it doesn't make some severe damage to codebase or database
-   Made sure to provide relevant specific context files to get best results



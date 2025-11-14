# AI Agent Workflow Log
## Agents Used
- **GitHub Copilot**
- **Gemini CLI**
- **Claude AI**
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
**Prompt:** Create a hexagonal architecture folder structure inside fronted/src for React + Tailwind frontend with:
src/
  core/
    domain/
    application/
    ports/
  adapters/
    ui/
    infrastructure/
  shared/

**Output:** [Generated the correct forlder structure]

**Validation/Corrections:**
-   i checked and it was correct

---

### Prompt 6: 
**Tool:** Claude AI
**Prompt:** You are an expert frontend dev your task is to give me a detailed fronted plan for following task along with colors, theme, font etc.
Make sure that we will not use any blue or purple in our UI as that has become very common among ai made apps.
we need to come up with better UI while also keeping in mind that this is the ui of a "Fuel EU Compliance Dashboard". make sure UI is beautiful. keep the plan detailed enough that any AI agent can easily properly implement it.

FRONTEND TASK — React (vite) + Tailwind + typescript
Objective
Create a Fuel EU Compliance Dashboard with four tabs:
Routes
Compare
Banking
Pooling
All values and API responses originate from the backend service described below.
Architecture (Hexagonal pattern)
src/ core/ domain/ application/ ports/ adapters/ ui/ infrastructure/ shared/


    • Core = domain entities, use-cases, and ports (no React dependencies)
    • UI adapters = React components and hooks implementing inbound ports
    • Infrastructure adapters = API clients implementing outbound ports
    • Styling via TailwindCSS

🧱 Functional Requirements
(1) Routes Tab
    • Display table of all routes fetched from /routes
    • Columns: routeId, vesselType, fuelType, year, ghgIntensity (gCO₂e/MJ), fuelConsumption (t), distance (km), totalEmissions (t)
    • “Set Baseline” button → calls POST /routes/:routeId/baseline
    • Filters: vesselType, fuelType, year
(2) Compare Tab
    • Fetch baseline + comparison data from /routes/comparison
    • Use target = 89.3368 gCO₂e/MJ (2 % below 91.16)
    • Display: 
        ○ Table with baseline vs comparison routes
        ○ Columns: ghgIntensity, % difference, compliant (✅ / ❌)
        ○ Chart (bar/line) comparing ghgIntensity values
        ○ Formula:
percentDiff = ((comparison / baseline) − 1) × 100
    (3) Banking Tab
    Implements Fuel EU Article 20 – Banking.
        • GET /compliance/cb?year=YYYY → shows current CB
        • POST /banking/bank → banks positive CB
        • POST /banking/apply → applies banked surplus to a deficit
        • KPIs: 
            ○ cb_before, applied, cb_after
        • Disable actions if CB ≤ 0; show errors from API
    (4) Pooling Tab
    Implements Fuel EU Article 21 – Pooling.
        • GET /compliance/adjusted-cb?year=YYYY → fetch adjusted CB per ship
        • POST /pools → create pool with members
        • Rules: 
            ○ Sum(adjustedCB) ≥ 0
            ○ Deficit ship cannot exit worse
            Surplus ship cannot exit negative
            UI:
            List members with before/after CBs
            Pool Sum indicator (red/green)
            Disable “Create Pool” if invalid
            KPIs Dataset (for mock or seed data)
            routeId    vesselType    fuelType    year    ghgIntensity    fuelConsumption (t)    distance (km)    totalEmissions (t)
            R001    Container    HFO    2024    91.0    5000    12000    4500
            R002    BulkCarrier    LNG    2024    88.0    4800    11500    4200
            R003    Tanker    MGO    2024    93.5    5100    12500    4700
            R004    RoRo    HFO    2025    89.2    4900    11800    4300
            R005    Container    LNG    2025    90.5    4950    11900    4400
            
Evaluation Checklist
Area    Criteria
Architecture    Proper hexagonal separation (core ↔ adapters)
Functionality    Routes, Compare, Banking, Pooling tabs work as specified
Code Quality    TS strict mode, ESLint/Prettier, clean naming
UI    Responsive, accessible, clear data visualization
Testing    Unit tests for use-cases and components


**Output:**
```
# Fuel EU Compliance Dashboard - Detailed Frontend Design Plan

## 🎨 Design System & Visual Identity

### Color Palette
**Primary Colors:**
- **Emerald Green** (Primary): `#10b981` (emerald-500) - Represents sustainability and compliance
- **Teal** (Secondary): `#14b8a6` (teal-500) - Professional, maritime feel
- **Amber** (Accent): `#f59e0b` (amber-500) - Warning states, attention items

**Semantic Colors:**
- **Success**: `#22c55e` (green-500) - Compliant status, positive CB
- **Warning**: `#f97316` (orange-500) - Near-limit values
- **Error**: `#ef4444` (red-500) - Non-compliant, deficits
- **Info**: `#06b6d4` (cyan-500) - Informational states

**Neutral Colors:**
- Background: `#0f172a` (slate-900) - Dark, professional
- Surface: `#1e293b` (slate-800) - Cards, panels
- Surface Elevated: `#334155` (slate-700) - Hover states
- Border: `#475569` (slate-600)
- Text Primary: `#f1f5f9` (slate-100)
- Text Secondary: `#cbd5e1` (slate-300)
- Text Muted: `#94a3b8` (slate-400)

### Typography
**Font Family:** 
- Primary: `'Inter', sans-serif` - Clean, modern, excellent readability
- Monospace: `'JetBrains Mono', monospace` - For data, numbers, codes

**Font Scales:**
```
- Display: text-4xl (36px) font-bold
- H1: text-3xl (30px) font-bold
- H2: text-2xl (24px) font-semibold
- H3: text-xl (20px) font-semibold
- Body Large: text-base (16px) font-medium
- Body: text-sm (14px) font-normal
- Caption: text-xs (12px) font-normal
- Label: text-sm (14px) font-medium uppercase tracking-wide
```

### Spacing System
```
- xs: 0.5rem (8px)
- sm: 0.75rem (12px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
```

## 🏗️ Layout Architecture

### Overall Shell
```
┌─────────────────────────────────────────┐
│  Header (72px height)                   │
│  [Logo] Dashboard Title    [Settings]   │
├─────────────────────────────────────────┤
│  Tab Navigation (56px height)           │
│  [Routes] [Compare] [Banking] [Pooling] │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (Dynamic based on active tab)          │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Header Design
- **Background**: `slate-900` with bottom border `slate-700`
- **Logo Area**: Emerald green ship icon with "Fuel EU" text in white
- **Title**: "Compliance Dashboard" in `slate-100`
- **Right Side**: User menu, notifications icon, settings gear

### Tab Navigation
- **Active Tab**: 
  - Background: `emerald-500/10`
  - Border bottom: `2px solid emerald-500`
  - Text: `emerald-400`
- **Inactive Tab**:
  - Text: `slate-400`
  - Hover: `slate-300` text, `slate-800` background
- **Style**: Pills with rounded-lg, smooth transitions

## 📊 Component Design Specifications

### 1. Routes Tab Layout

```
┌─────────────────────────────────────────────┐
│  Filters Bar                                │
│  [Vessel Type ▼] [Fuel Type ▼] [Year ▼]   │
│                          [Reset Filters]    │
├─────────────────────────────────────────────┤
│  Stats Cards Row                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │Total │ │Compli│ │Avg GHG│ │Total│       │
│  │Routes│ │ant % │ │Intens.│ │Emiss│       │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
├─────────────────────────────────────────────┤
│  Data Table                                 │
│  [All columns with sort indicators]         │
│  [Set Baseline] button per row              │
└─────────────────────────────────────────────┘
```

**Filter Dropdowns:**
- Background: `slate-800`
- Border: `slate-600`
- Hover: `slate-700` background
- Active/Open: `emerald-500` border
- Dropdown menu: `slate-700` background with subtle shadow

**Stats Cards:**
- Background: `slate-800`
- Border: `slate-700` with `1px` width
- Icon area: Circular background with `emerald-500/20`, icon in `emerald-400`
- Value: Large, `text-2xl`, `slate-100`
- Label: `text-sm`, `slate-400`, uppercase
- Padding: `p-6`
- Border radius: `rounded-xl`
- Hover effect: Lift with shadow, `translate-y-[-2px]`

**Data Table:**
- Header: `slate-800` background, `slate-100` text, sticky on scroll
- Row: `slate-900/50` background
- Row Hover: `slate-800` background
- Alternating rows: Subtle `slate-800/30` for even rows
- Border: `slate-700` between rows
- Cell padding: `px-4 py-3`
- Sort icons: `slate-400`, active in `emerald-400`
- Action button ("Set Baseline"): 
  - Small size, `rounded-lg`
  - Background: `emerald-500`
  - Hover: `emerald-400`
  - Text: white, `text-xs`

### 2. Compare Tab Layout

```
┌─────────────────────────────────────────────┐
│  Comparison Summary                         │
│  ┌────────────┐  ┌────────────┐            │
│  │  Baseline  │  │ Comparison │            │
│  │  89.3 gCO₂ │  │  91.2 gCO₂ │            │
│  └────────────┘  └────────────┘            │
│  Target: 89.34 gCO₂e/MJ (2% below baseline)│
├─────────────────────────────────────────────┤
│  Visualization Chart (60% width)            │
│  [Bar/Line chart showing comparison]        │
├─────────────────────────────────────────────┤
│  Comparison Table (Full width)              │
│  Route | Baseline | Comparison | Diff | ✓  │
└─────────────────────────────────────────────┘
```

**Comparison Cards:**
- Large cards with gradient backgrounds:
  - Baseline: `from-teal-500/10 to-teal-600/5`
  - Comparison: `from-amber-500/10 to-amber-600/5`
- Border: `2px` in respective accent color
- Value: `text-4xl`, bold, colored (teal or amber)
- Label: `slate-300`, `text-sm`

**Chart Area:**
- Background: `slate-800`
- Border: `slate-700`
- Padding: `p-6`
- Border radius: `rounded-xl`
- Chart colors:
  - Baseline bars: `teal-500`
  - Comparison bars: `amber-500`
  - Target line: `red-500` dashed
  - Grid lines: `slate-700`
  - Axis labels: `slate-400`

**Compliance Indicators:**
- ✅ Compliant: `green-500` with checkmark icon
- ❌ Non-compliant: `red-500` with X icon
- Badge style: `rounded-full`, `px-3 py-1`, `text-xs`, `font-semibold`

### 3. Banking Tab Layout

```
┌─────────────────────────────────────────────┐
│  Year Selector: [2024 ▼]                   │
├─────────────────────────────────────────────┤
│  Current Compliance Balance                 │
│  ┌───────────────────────────────────────┐ │
│  │  CB Before: +250 tCO₂e                │ │
│  │  Available to Bank                     │ │
│  └───────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  Actions                                    │
│  ┌─────────────┐  ┌─────────────┐         │
│  │ Bank Surplus│  │Apply Banked │         │
│  │             │  │   Credit    │         │
│  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────┤
│  Transaction History                        │
│  Date | Action | Amount | CB After          │
└─────────────────────────────────────────────┘
```

**CB Display Card:**
- Large, prominent card
- Background: Gradient based on status
  - Positive CB: `from-green-500/20 to-green-600/10`
  - Negative CB: `from-red-500/20 to-red-600/10`
- Value display: `text-5xl`, colored based on sign
- Icon: Arrow up (green) or down (red)
- Border: `2px`, colored based on status

**Action Buttons:**
- Large cards with icon and text
- Background: `slate-800`
- Border: `slate-700`
- Hover: `emerald-500/10` background, `emerald-500` border
- Disabled state: `slate-700` background, `slate-600` text, `cursor-not-allowed`
- Icon size: `w-12 h-12`
- Padding: `p-8`

**Transaction History Table:**
- Compact style
- Timeline indicator on left side
- Color-coded amounts (green for positive, red for negative)
- Date in `slate-400`, `text-xs`

### 4. Pooling Tab Layout

```
┌─────────────────────────────────────────────┐
│  Year Selector: [2025 ▼]                   │
├─────────────────────────────────────────────┤
│  Pool Configuration                         │
│  ┌─────────────────────────────────────┐   │
│  │ Available Ships                     │   │
│  │ [Ship A: +120 CB] [Add to Pool →]  │   │
│  │ [Ship B: -80 CB]  [Add to Pool →]  │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Current Pool Members                       │
│  ┌─────────────────────────────────────┐   │
│  │ Ship A: +120 → +40 ✓               │   │
│  │ Ship B: -80 → 0 ✓                  │   │
│  │ Pool Sum: +40 ✓                    │   │
│  └─────────────────────────────────────┘   │
│  [Create Pool] [Reset]                      │
└─────────────────────────────────────────────┘
```

**Ship Selection Cards:**
- Two-column layout
- Each ship as a card with:
  - Ship name/ID
  - Current adjusted CB with color coding
  - Checkbox or add button
  - Background: `slate-800`
  - Selected state: `emerald-500/20` background, `emerald-500` border

**Pool Summary Panel:**
- Fixed position on right or bottom
- Shows selected members
- Real-time calculation display
- Before → After arrows with colors
- Pool sum indicator:
  - Background: Large card with status color
  - Valid pool: `green-500/20` background
  - Invalid pool: `red-500/20` background
- Validation messages with icons

**Create Pool Button:**
- Large, prominent
- Full width or centered
- Disabled when invalid with tooltip explaining why
- Enabled: `emerald-500` background, pulse animation
- Hover: `emerald-400`

## 🎭 Interaction Design

### Micro-interactions
1. **Button Hover**: Scale 1.02, transition 200ms
2. **Card Hover**: Lift effect with shadow, translate-y-[-4px]
3. **Loading States**: Shimmer effect in `slate-700/50`
4. **Success Actions**: Green checkmark with scale animation
5. **Error States**: Shake animation, red border pulse
6. **Tab Switching**: Fade in/out content, 300ms duration
7. **Filter Application**: Smooth table re-render with stagger animation

### Loading States
- **Skeleton Screens**: `slate-800` background with animated gradient
- **Spinner**: Circular, `emerald-500`, `w-8 h-8` for full page
- **Inline Loaders**: Smaller spinners for button actions

### Empty States
- Centered content with icon
- Icon: `slate-700`, large (96px)
- Message: `slate-400`, `text-lg`
- Action button if applicable: `emerald-500`

### Error States
- Toast notifications: Top-right corner
- Background: `red-500`
- Text: white
- Icon: Alert triangle
- Auto-dismiss after 5s with progress bar

### Success States
- Toast notifications: Top-right corner
- Background: `green-500`
- Icon: Checkmark
- Auto-dismiss after 3s

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

**Mobile (<768px):**
- Stack all cards vertically
- Horizontal scroll for tables
- Hamburger menu for tabs
- Simplified chart views

**Tablet (768px-1024px):**
- Two-column grid for cards
- Full tables with horizontal scroll if needed
- Visible tabs

**Desktop (>1024px):**
- Full layout as designed
- Side-by-side comparisons
- No scrolling needed for primary content

## 🎯 Accessibility Requirements

1. **Color Contrast**: Minimum 4.5:1 for normal text
2. **Focus States**: `ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900`
3. **Keyboard Navigation**: All interactive elements accessible via Tab
4. **ARIA Labels**: Proper labeling for screen readers
5. **Semantic HTML**: Use proper heading hierarchy
6. **Alt Text**: All icons have descriptive text alternatives

## 🧩 Component Library Structure

typescript
// Button variants
- primary: emerald-500 background
- secondary: slate-700 background
- outline: border only
- ghost: transparent, hover effect
- danger: red-500 background

// Card variants
- default: slate-800 background
- elevated: slate-700 background with shadow
- outlined: border only
- gradient: with color gradient background

// Badge variants
- success: green-500
- warning: orange-500
- error: red-500
- info: cyan-500
- neutral: slate-600
```

## 🎨 Implementation Priority

**Phase 1: Core UI**
1. Design system setup (colors, typography in Tailwind config)
2. Layout shell (header, navigation)
3. Routes tab with table and filters

**Phase 2: Advanced Features**
4. Compare tab with charts
5. Stats cards and KPIs

**Phase 3: Complex Logic**
6. Banking tab with transaction logic
7. Pooling tab with validation

**Phase 4: Polish**
8. Animations and micro-interactions
9. Loading and error states
10. Responsive refinements

## 📝 Implementation Notes for AI Agent

1. **Tailwind Config**: Add Inter font and custom colors to `tailwind.config.js`
2. **Chart Library**: Use `recharts` for bar/line charts with custom styling
3. **Icons**: Use `lucide-react` for all icons (Ship, TrendingUp, Database, Users, etc.)
4. **State Management**: React Context or Zustand for global state
5. **Form Validation**: Zod for type-safe validation
6. **Data Formatting**: Use `Intl.NumberFormat` for numbers, dates
7. **Animations**: Use Tailwind's `transition` utilities + Framer Motion for complex animations

This design creates a **professional, maritime-themed dashboard** that avoids the typical blue/purple AI app aesthetic while maintaining excellent usability and visual appeal. The emerald/teal palette evokes sustainability and maritime themes, perfect for fuel compliance monitoring.

```

**Validation/Corrections:**
-   i read the plan and it seems perfect for mvp


---
## Observations
-   gemini-cli still has some issues like it get stuck after running cmds like "npm run dev" as it probably has no trigger to understand completion of such open ended commands
-   copilot sometimes gets stuck in errors thats when i need to take over the code and handle issues
-   claude gave way more detailed design plan than needed but that actually helped later when implementing the ui. gemini and copilot would've probably just given basic

---
## Best Practices Followed
-   Whenever using agent mode, i always made sure to review the suggested changes and not set agent on 'allow always (auto)' to ensure it doesn't make some severe damage to codebase or database
-   Made sure to provide relevant specific context files to get best results
-   after each task, start a new chat as these agents often starts performing bad after getting exposed to a large amount of context.
-   Used github copilot to generate good commit messages
-   kept prompts focused on single responsibility - like "refactor routes_repository first" instead of asking to refactor all repos at once. made the changes more manageable
-   used the validation/corrections section in my log to track what worked and what didn't. helped me understand which agent is good at what type of task



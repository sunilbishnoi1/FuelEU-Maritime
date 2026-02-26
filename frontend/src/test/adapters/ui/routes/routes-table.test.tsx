import { render, screen, fireEvent } from '@testing-library/react';
import { RoutesTable } from '../../../../adapters/ui/routes/routes-table';
import type { Route } from '../../../../core/domain/entities';

describe('RoutesTable Component', () => {
  const mockRoutes: Route[] = [
    {
      id: '1',
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: false,
    },
    {
      id: '2',
      routeId: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: true,
    },
  ];

  it('renders "No Routes Found" when routes array is empty', () => {
    render(<RoutesTable routes={[]} onSetBaseline={() => {}} />);
    expect(screen.getByText('No Routes Found')).toBeInTheDocument();
  });

  it('renders a list of routes', () => {
    render(<RoutesTable routes={mockRoutes} onSetBaseline={() => {}} />);
    expect(screen.getByText('R001')).toBeInTheDocument();
    expect(screen.getByText('R002')).toBeInTheDocument();
    expect(screen.getByText('Container')).toBeInTheDocument();
    expect(screen.getByText('BulkCarrier')).toBeInTheDocument();
  });

  it('shows "Baseline" badge for baseline route', () => {
    render(<RoutesTable routes={mockRoutes} onSetBaseline={() => {}} />);
    expect(screen.getByText('Baseline')).toBeInTheDocument();
  });

  it('calls onSetBaseline when "Set Baseline" button is clicked', () => {
    const onSetBaseline = vi.fn();
    render(<RoutesTable routes={mockRoutes} onSetBaseline={onSetBaseline} />);
    
    const setBaselineButtons = screen.getAllByRole('button', { name: /set baseline/i });
    fireEvent.click(setBaselineButtons[0]);
    
    expect(onSetBaseline).toHaveBeenCalledWith('1');
  });

  it('disables the button while setting baseline', async () => {
    const onSetBaseline = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<RoutesTable routes={mockRoutes} onSetBaseline={onSetBaseline} />);
    
    const setBaselineButton = screen.getAllByRole('button', { name: /set baseline/i })[0];
    fireEvent.click(setBaselineButton);
    
    expect(setBaselineButton).toBeDisabled();
    expect(screen.getByText('Setting...')).toBeInTheDocument();
  });
});

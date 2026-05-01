/**
 * @file src/tests/boothFinder.test.jsx
 * @description Vitest tests for the BoothFinder component. This file contains tests for rendering,
 * geolocation functionality, address search, and error handling, using mocks for external services
 * like the Geolocation API and our custom mapsService.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BoothFinder from '../components/Booth/BoothFinder';
import * as mapsService from '../services/mapsService';
import { validateAddress } from '../utils/validators';

// Mock the services
vi.mock('../services/mapsService');
vi.mock('../utils/validators');

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

// Mock the global navigator object
Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
});

describe('BoothFinder', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock successful validation by default
    validateAddress.mockReturnValue({ success: true });
    // Mock google maps object
    global.google = {
        maps: {
            Marker: vi.fn(() => ({
                setMap: vi.fn(),
            })),
        },
    };
  });

  it('renders the map container and search controls', () => {
    render(<BoothFinder />);
    expect(screen.getByLabelText('Map showing polling booth locations')).toBeInTheDocument();
    expect(screen.getByText('Use My Location')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your address')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('"Use My Location" button triggers geolocation', () => {
    render(<BoothFinder />);
    const locationButton = screen.getByText('Use My Location');
    fireEvent.click(locationButton);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledOnce();
  });

  it('displays an error if geolocation is denied', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error({ message: 'User denied Geolocation' });
    });
    render(<BoothFinder />);
    const locationButton = screen.getByText('Use My Location');
    fireEvent.click(locationButton);
    await waitFor(() => {
        expect(screen.getByText('Unable to retrieve your location. Please grant location permission.')).toBeInTheDocument();
    });
  });

  it('validates address input before searching', async () => {
    validateAddress.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid address' }] } });
    render(<BoothFinder />);
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getByText('Invalid address')).toBeInTheDocument();
    });
    expect(mapsService.geocodeAddress).not.toHaveBeenCalled();
  });

  it('calls geocodeAddress and findNearbyBooths on valid address search', async () => {
    const mockLocation = { lat: 12.9716, lng: 77.5946 };
    const mockBooths = [{ name: 'Test Booth', vicinity: 'Test Address', geometry: { location: mockLocation } }];
    mapsService.geocodeAddress.mockResolvedValue(mockLocation);
    mapsService.findNearbyBooths.mockResolvedValue(mockBooths);
    mapsService.initMap.mockResolvedValue({ setCenter: vi.fn() });

    render(<BoothFinder />);
    const addressInput = screen.getByPlaceholderText('Enter your address');
    const searchButton = screen.getByText('Search');

    fireEvent.change(addressInput, { target: { value: 'Bengaluru, Karnataka' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mapsService.geocodeAddress).toHaveBeenCalledWith('Bengaluru, Karnataka');
    });
    await waitFor(() => {
      expect(mapsService.findNearbyBooths).toHaveBeenCalled();
    });
    await waitFor(() => {
        expect(screen.getByText('Test Booth')).toBeInTheDocument();
    });
  });

  it('handles geocoding API errors gracefully', async () => {
    mapsService.geocodeAddress.mockRejectedValue(new Error('Geocoding failed'));
    render(<BoothFinder />);
    const addressInput = screen.getByPlaceholderText('Enter your address');
    const searchButton = screen.getByText('Search');

    fireEvent.change(addressInput, { target: { value: 'Valid Address 12345' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Could not find a location for the address provided.')).toBeInTheDocument();
    });
  });
});

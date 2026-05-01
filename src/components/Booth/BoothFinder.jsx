/* global google */
/**
 * @file src/components/Map/BoothFinder.jsx
 * @description This component provides a map-based interface for users to find nearby polling booths.
 * It allows searching by current location or by a manual address input. It uses the Google Maps API
 * for mapping, geocoding, and displaying markers.
 */
import { useState, useRef, useEffect } from 'react';
import { initMap } from '../../services/mapsService';
import { validateAddress } from '../../utils/validators';
import { sanitizeInput, validateTextInput } from '../../utils/security';
import { useDebounce } from '../../hooks/useDebounce';

const BoothFinder = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [booths, setBooths] = useState([]);
  const [address, setAddress] = useState('');
  const debouncedAddress = useDebounce(address, 300);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const safeAddress = debouncedAddress || '';
    if (safeAddress) {
        const validation = validateTextInput(safeAddress, 100);
        if (!validation.isValid) {
            setError(validation.message);
        } else {
            setError(null);
        }
    } else {
        setError(null);
    }
  }, [debouncedAddress]);

  /**
   * Clears existing markers from the map.
   */
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  /**
   * Initializes the map and finds nearby booths.
   * @param {google.maps.LatLngLiteral} location The latitude and longitude to center the map on.
   */
  const initAndFind = async (location) => {
    setLoading(true);
    setError(null);
    setBooths([]);
    clearMarkers();

    try {
      let currentMap = map;
      if (!currentMap && mapRef.current) {
        currentMap = await mapsService.initMap(mapRef.current, {
          center: location,
          zoom: 14,
        });
        setMap(currentMap);
      } else if (currentMap) {
        currentMap.setCenter(location);
      }

      if (currentMap) {
        const nearbyBooths = await mapsService.findNearbyBooths(currentMap, location);
        setBooths(nearbyBooths);

        const newMarkers = nearbyBooths.map(booth => {
          const marker = new google.maps.Marker({
            position: booth.geometry.location,
            map: currentMap,
            title: booth.name,
          });
          return marker;
        });
        setMarkers(newMarkers);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Map initialization/search error:', err);
      setError('Could not find polling booths. Please try a different location.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the "Use My Location" button click.
   */
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        initAndFind({ lat: latitude, lng: longitude });
      },
      () => {
        setError('Unable to retrieve your location. Please grant location permission.');
        setLoading(false);
      }
    );
  };

  /**
   * Handles the address search form submission.
   * @param {React.FormEvent<HTMLFormElement>} e The form event.
   */
  const handleAddressSearch = async (e) => {
    e.preventDefault();

    const sanitizedAddress = sanitizeInput(address);
    const validation = validateTextInput(sanitizedAddress, 100); // Shorter length for address
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    const addressValidation = validateAddress(sanitizedAddress);
    if (!addressValidation.success) {
      setError(addressValidation.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const location = await mapsService.geocodeAddress(sanitizedAddress);
      if (location) {
        initAndFind(location);
      } else {
        setError('Could not find a location for the address provided.');
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Geocoding error:', err);
      setError('Could not find a location for the address provided.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup markers on unmount
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Your Polling Booth</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={handleUseLocation}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Use My Location
        </button>
        <form onSubmit={handleAddressSearch} className="flex-grow flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            aria-label="Address for polling booth search"
            aria-invalid={!!error}
            aria-describedby="booth-error"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={loading}
            maxLength="100"
          />
          <button
            type="submit"
            disabled={loading || !!error}
            className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center my-8" role="status">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Searching for booths...</p>
        </div>
      )}

      {error && <p id="booth-error" className="text-red-600 bg-red-100 p-3 rounded-lg my-4">{error}</p>}

      <div
        id="map-container"
        ref={mapRef}
        className="w-full h-[400px] bg-gray-200 rounded-lg my-4"
        aria-label="Map showing polling booth locations"
      ></div>

      {booths.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nearby Booths:</h3>
          <ul className="space-y-2">
            {booths.map((booth, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded-md border">
                <p className="font-bold">{booth.name}</p>
                <p className="text-sm text-gray-600">{booth.vicinity}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BoothFinder;

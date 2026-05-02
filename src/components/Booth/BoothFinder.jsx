/* global google */
/**
 * @file src/components/Map/BoothFinder.jsx
 * @description This component provides a map-based interface for users to find nearby polling booths.
 * It allows searching by current location or by a manual address input. It uses the Google Maps API
 * for mapping, geocoding, and displaying markers.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as mapsService from '../../services/mapsService';
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

  const uiContent = useMemo(() => ({
    title: 'Find Your Polling Booth',
    useLocationButton: 'Use My Location',
    addressPlaceholder: 'Enter your address',
    searchButton: 'Search',
    searchingText: 'Searching for booths...',
    geolocationUnsupported: 'Geolocation is not supported by your browser.',
    geolocationPermissionError: 'Unable to retrieve your location. Please grant location permission.',
    boothSearchError: 'Could not find polling booths. Please try a different location.',
    geocodeError: 'Could not find a location for the address provided.',
  }), []);

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

  const clearMarkers = useCallback(() => {
    const safeMarkers = Array.isArray(markers) ? markers : [];
    safeMarkers.forEach(marker => marker?.setMap(null));
    setMarkers([]);
  }, [markers]);

  const initAndFind = useCallback(async (location) => {
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
        const safeBooths = Array.isArray(nearbyBooths) ? nearbyBooths : [];
        setBooths(safeBooths);

        const newMarkers = safeBooths.map(booth => {
          if (booth?.geometry?.location) {
            const marker = new google.maps.Marker({
              position: booth.geometry.location,
              map: currentMap,
              title: booth.name,
            });
            return marker;
          }
          return null;
        }).filter(Boolean);
        setMarkers(newMarkers);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Map initialization/search error:', err);
      setError(uiContent.boothSearchError);
    } finally {
      setLoading(false);
    }
  }, [map, clearMarkers, uiContent.boothSearchError]);

  const handleUseLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      setError(uiContent.geolocationUnsupported);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position?.coords || {};
        if (latitude && longitude) {
          initAndFind({ lat: latitude, lng: longitude });
        } else {
          setError(uiContent.geolocationPermissionError);
          setLoading(false);
        }
      },
      () => {
        setError(uiContent.geolocationPermissionError);
        setLoading(false);
      }
    );
  }, [initAndFind, uiContent.geolocationUnsupported, uiContent.geolocationPermissionError]);

  const handleAddressSearch = useCallback(async (e) => {
    e.preventDefault();

    const sanitizedAddress = sanitizeInput(address);
    const validation = validateTextInput(sanitizedAddress, 100);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    const addressValidation = validateAddress(sanitizedAddress);
    if (!addressValidation.success) {
      setError(addressValidation.error?.issues?.[0]?.message || uiContent.geocodeError);
      return;
    }
    setLoading(true);
    try {
      const location = await mapsService.geocodeAddress(sanitizedAddress);
      if (location) {
        initAndFind(location);
      } else {
        setError(uiContent.geocodeError);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Geocoding error:', err);
      setError(uiContent.geocodeError);
    } finally {
      setLoading(false);
    }
  }, [address, initAndFind, uiContent.geocodeError]);

  useEffect(() => {
    return () => {
      const safeMarkers = Array.isArray(markers) ? markers : [];
      safeMarkers.forEach(marker => marker?.setMap(null));
    };
  }, [markers]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{uiContent.title}</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={handleUseLocation}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uiContent.useLocationButton}
        </button>
        <form onSubmit={handleAddressSearch} className="flex-grow flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value || '')}
            placeholder={uiContent.addressPlaceholder}
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
            {uiContent.searchButton}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center my-8" role="status">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">{uiContent.searchingText}</p>
        </div>
      )}

      {error && <p id="booth-error" className="text-red-600 bg-red-100 p-3 rounded-lg my-4">{error}</p>}

      <div
        id="map-container"
        ref={mapRef}
        className="w-full h-[400px] bg-gray-200 rounded-lg my-4"
        aria-label="Map showing polling booth locations"
      >
        {booths.length > 0 && (
          <ul className="sr-only">
            {(Array.isArray(booths) ? booths : []).map((booth, index) => (
              <li key={index}>{booth?.name || 'Unnamed booth'} at {booth?.vicinity || 'Unknown address'}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BoothFinder;

/**
 * @file A component for finding nearby polling booths.
 */
import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { initializeMap, findNearbyBooths, geocodeAddress } from '../../services/mapsService';

/**
 * BoothFinder component helps users find polling booths on a map.
 * @param {{persona: object}} props
 * @returns {React.ReactElement} - The BoothFinder component.
 */
const BoothFinder = ({ persona }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      initializeMap(mapRef.current)
        .then(setMap)
        .catch(err => {
          if (import.meta.env.DEV) {
            console.error(err);
          }
          setError('Failed to load the map.');
        });
    }
  }, [mapRef, map]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const address = event.target.elements.address.value;
    if (!address.trim()) return;

    try {
      const geoResult = await geocodeAddress(address);
      const location = geoResult.geometry.location;
      map.setCenter(location);
      map.setZoom(14);
      const booths = await findNearbyBooths(location.lat(), location.lng());
      // In a real app, you would render markers for these booths.
      if (import.meta.env.DEV) {
        console.log('Found booths:', booths);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(err);
      }
      setError('Could not find booths for that address.');
    }
  };

  return (
    <div className="p-4" role="application" aria-label="Polling Booth Finder">
      <p className="mb-4 text-sm text-gray-600">Current Persona: {persona.label}</p>
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          name="address"
          aria-label="Enter your address"
          placeholder="Enter your address or pincode"
          className="flex-grow p-2 border rounded-l-md"
        />
        <button type="submit" className="bg-primary text-white p-2 rounded-r-md">Search</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} aria-label="Map of polling booths"></div>
    </div>
  );
};

BoothFinder.propTypes = {
    persona: PropTypes.object
};

export default BoothFinder;

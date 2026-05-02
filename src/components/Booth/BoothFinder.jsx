import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useState, useEffect, useRef } from 'react';
import { logger } from '../../utils/logger';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapComponent = ({ center, zoom }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    if (ref.current && !map) {
        const newMap = new window.google.maps.Map(ref.current, {
            center,
            zoom,
            mapId: 'ELECTIQ_MAP_ID' 
        });
        setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  return <div ref={ref} style={{ height: "400px", width: "100%" }} />;
};

const render = (status) => {
    switch (status) {
        case Status.LOADING:
            return <p>Loading...</p>;
        case Status.FAILURE:
            return <p>Error loading map.</p>;
        case Status.SUCCESS:
            return <MapComponent center={{ lat: 20.5937, lng: 78.9629 }} zoom={5} />;
    }
};

const BoothFinder = () => {
    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="text-red-500 text-center p-4">Google Maps API Key is missing. Please check your .env file.</div>;
    }
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Find Your Polling Booth</h2>
            <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render} />
        </div>
    );
};

export default BoothFinder;

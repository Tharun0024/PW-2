/**
 * @file Service for interacting with the Google Maps API.
 */

import { Loader } from '@googlemaps/js-api-loader';

/* global google */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const loader = new Loader({
  apiKey: API_KEY,
  version: 'weekly',
  libraries: ['places', 'geocoding'],
});

let mapInstance = null;
let geocoderInstance = null;
let placesServiceInstance = null;

/**
 * Initializes a Google Map in a given HTML element.
 * @param {HTMLElement} mapElement - The HTML element to render the map in.
 * @returns {Promise<google.maps.Map>} - A promise that resolves with the map instance.
 */
export async function initializeMap(mapElement) {
    await loader.load();
    mapInstance = new google.maps.Map(mapElement, {
      center: { lat: 20.5937, lng: 78.9629 }, // Centered on India
      zoom: 5,
    });
    placesServiceInstance = new google.maps.places.PlacesService(mapInstance);
    geocoderInstance = new google.maps.Geocoder();
    return mapInstance;
}

/**
 * Finds nearby polling booths using the Places API.
 * @param {number} latitude - The user's latitude.
 * @param {number} longitude - The user's longitude.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of nearby places.
 */
export async function findNearbyBooths(latitude, longitude) {
  if (!placesServiceInstance) {
    throw new Error('Map is not initialized. Call initializeMap first.');
  }
  const request = {
    location: new google.maps.LatLng(latitude, longitude),
    radius: 5000, // 5km radius
    keyword: 'polling booth',
  };

  return new Promise((resolve, reject) => {
    placesServiceInstance.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(new Error(`Places search failed with status: ${status}`));
      }
    });
  });
}

/**
 * Geocodes an address string to latitude and longitude.
 * @param {string} address - The address to geocode.
 * @returns {Promise<object>} - A promise that resolves with the geocoding result.
 */
export async function geocodeAddress(address) {
  if (!geocoderInstance) {
    throw new Error('Map is not initialized. Call initializeMap first.');
  }

  return new Promise((resolve, reject) => {
    geocoderInstance.geocode({ address: address, componentRestrictions: { country: 'IN' } }, (results, status) => {
      if (status === 'OK') {
        resolve(results[0]);
      } else {
        reject(new Error(`Geocode was not successful for the following reason: ${status}`));
      }
    });
  });
}

export const initMap = async (mapRef, address) => {
  await loader.load();
  const geocoder = new google.maps.Geocoder();
  const map = new google.maps.Map(mapRef.current, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
      });
    } else {
      throw new Error('Geocode was not successful for the following reason: ' + status);
    }
  });
};

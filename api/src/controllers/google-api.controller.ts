// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {  param,  get,  response,} from '@loopback/rest';
import axios from 'axios';

export class GoogleApiController {
  constructor() {}

  @get('/location-by-pincode/{pincode}')
  @response(200, {
    description: 'Location data from Google Geocoding API',
  })
  async getLocationByPincode(
    @param.path.string('pincode') pincode: string,
  ): Promise<object> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Set this in .env
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;

      const response = await axios.get(url);

      const addressComponents =
        response.data?.results?.[0]?.address_components ?? [];

      const city =
        addressComponents.find((c: any) => c.types.includes('locality'))
          ?.long_name ?? '';

      const state =
        addressComponents.find((c: any) =>
          c.types.includes('administrative_area_level_1'),
        )?.long_name ?? '';

      const country =
        addressComponents.find((c: any) => c.types.includes('country'))
          ?.long_name ?? '';

      return {
        city,
        state,
        country,
        raw: response.data, // optional: return full raw response for debugging
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location from Google API');
    }
  }
}

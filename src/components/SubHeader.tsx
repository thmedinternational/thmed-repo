import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react'; // Import Loader2 for loading state
import { useGeolocation } from '@/hooks/useGeolocation'; // Import the new hook

const SubHeader: React.FC = () => {
  const googleMapsAddress = "cs07-cs08 Sunshine bazaar complex simon mazorodze Harare";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsAddress)}`;

  const { loading, error, position } = useGeolocation(); // Use the geolocation hook

  let locationText = "Location unavailable";
  let locationIcon = <MapPin className="h-4 w-4" />;

  if (loading) {
    locationText = "Fetching location...";
    locationIcon = <Loader2 className="h-4 w-4 animate-spin" />;
  } else if (error) {
    locationText = "Location unavailable";
    // Optionally, you could show a more specific error message
    // e.g., if (error.code === error.PERMISSION_DENIED) locationText = "Location permission denied";
  } else if (position) {
    // For simplicity, just indicate location is detected.
    // To show city/country, a reverse geocoding API would be needed.
    locationText = "Location detected";
    // Or, to show coordinates: `Lat: ${position.coords.latitude.toFixed(2)}, Lon: ${position.coords.longitude.toFixed(2)}`;
  }

  return (
    <div className="bg-background border-b text-muted-foreground py-2 text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-1">
          {locationIcon}
          <span>{locationText}</span>
        </div>
        <nav className="flex items-center space-x-4">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Store locator</a>
          <Link to="/about" className="hover:underline">Pharmacy start-up kit</Link>
          <Link to="/contact" className="hover:underline">Need help?</Link>
        </nav>
      </div>
    </div>
  );
};

export default SubHeader;
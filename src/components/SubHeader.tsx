import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance } from '@/utils/geolocation'; // Import the new utility

const SubHeader: React.FC = () => {
  const googleMapsAddress = "cs07-cs08 Sunshine bazaar complex simon mazorodze Harare";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsAddress)}`;

  // Store location coordinates (approximate for Harare CBD)
  const STORE_LAT = -17.8319;
  const STORE_LON = 31.0498;
  const DELIVERY_THRESHOLD_KM = 40; // Define the 40km threshold

  const { loading, error, position } = useGeolocation();

  let locationText = "Location unavailable";
  let locationIcon = <MapPin className="h-4 w-4" />;
  let locationColorClass = "text-muted-foreground";

  if (loading) {
    locationText = "Fetching location...";
    locationIcon = <Loader2 className="h-4 w-4 animate-spin" />;
  } else if (error) {
    locationText = "Location unavailable";
    locationColorClass = "text-red-500";
  } else if (position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const distance = haversineDistance(userLat, userLon, STORE_LAT, STORE_LON);

    if (distance > DELIVERY_THRESHOLD_KM) {
      locationText = `You are currently ${distance.toFixed(0)}km away. You may need to request delivery.`;
      locationColorClass = "text-orange-600";
    } else {
      locationText = `Delivery available at lower price (${distance.toFixed(0)}km from shop).`;
      locationColorClass = "text-green-600";
    }
  }

  return (
    <div className="bg-background border-b text-muted-foreground py-2 text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className={`flex items-center space-x-1 ${locationColorClass}`}>
          {locationIcon}
          <span>{locationText}</span>
        </div>
        <nav className="flex items-center space-x-4">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Store locator</a>
          <Link to="/about" className="hover:underline">Pharmacy start-up kit</Link>
          <a 
            href="https://wa.me/263775224209" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
          >
            Need help?
          </a>
        </nav>
      </div>
    </div>
  );
};

export default SubHeader;
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const SubHeader: React.FC = () => {
  const googleMapsAddress = "cs07-cs08 Sunshine bazaar complex simon mazorodze Harare";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsAddress)}`;

  return (
    <div className="bg-background border-b text-muted-foreground py-2 text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>Midrand, 1682</span> {/* Placeholder location */}
        </div>
        <nav className="flex items-center space-x-4">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Store locator</a>
          <Link to="#" className="hover:underline">Digital leaflets</Link>
          <Link to="/contact" className="hover:underline">Need help?</Link>
        </nav>
      </div>
    </div>
  );
};

export default SubHeader;
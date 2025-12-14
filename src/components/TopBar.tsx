import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopBar: React.FC = () => {
  return (
    <div className="bg-red-600 text-white py-2 text-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4" />
          <span className="font-semibold">Festive Season Specials Now On!</span>
        </div>
        <div className="flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-red-700 focus:ring-0 focus:ring-offset-0">
                Learn more <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/contact">Contact Us</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/about">About Us</Link>
              </DropdownMenuItem>
              {/* Add more service links here */}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/login" className="flex items-center space-x-1 text-white hover:text-gray-200">
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
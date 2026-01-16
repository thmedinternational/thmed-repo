import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopBar: React.FC = () => {
  return (
    <div className="bg-secondary text-secondary-foreground py-2 text-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span className="font-semibold">Welcome to TH-MED International</span>
        </div>
        <div className="flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-secondary-foreground hover:bg-secondary/80 focus:ring-0 focus:ring-offset-0 h-auto p-0">
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
          <Link to="/login" className="flex items-center space-x-1 text-secondary-foreground hover:text-secondary-foreground/80">
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
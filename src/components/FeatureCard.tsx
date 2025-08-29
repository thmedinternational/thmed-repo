import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="flex flex-col items-center text-center p-6 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
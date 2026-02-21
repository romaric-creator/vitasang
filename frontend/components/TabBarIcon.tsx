import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

interface TabBarIconProps {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size:number
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color,size }) => {
  return <FontAwesome size={size} name={name} color={color} />;
};

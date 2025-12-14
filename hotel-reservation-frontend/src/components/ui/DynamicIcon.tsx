// src/components/ui/DynamicIcon.tsx
// version: 1.0.0
// NOTE: Imports all Lucide icons to support dynamic naming from backend.
// Usually tree-shaking removes unused exports, but mapping strings requires 'icons' object access.

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 24, className, ...props }) => {
  // 1. Find the icon component in Lucide library by name (PascalCase)
  const IconComponent = (LucideIcons as any)[name];

  // 2. Fallback if icon name is invalid or not found
  if (!IconComponent) {
    // console.warn(`Icon "${name}" not found in lucide-react`);
    const DefaultIcon = LucideIcons.MapPin; 
    return <DefaultIcon size={size} className={className} {...props} />;
  }

  // 3. Render the specific icon
  return <IconComponent size={size} className={className} {...props} />;
};

export default DynamicIcon;

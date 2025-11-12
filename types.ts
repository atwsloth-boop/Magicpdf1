// Fix: Import React to resolve the 'Cannot find namespace "React"' error.
import React from 'react';

export enum ToolCategory {
  PDF = 'PDF Tools',
  IMAGE = 'Image Tools',
  TEXT = 'Text Tools',
  UTILITY = 'Utility Tools',
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ToolCategory;
}
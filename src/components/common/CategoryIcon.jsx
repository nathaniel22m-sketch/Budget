import React from 'react'
import {
  Home,
  Utensils,
  Coffee,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Plane,
  Repeat,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  DollarSign,
  Tag,
  Circle
} from 'lucide-react'

const ICON_MAP = {
  Home,
  Utensils,
  Coffee,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Plane,
  Repeat,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  DollarSign,
  Tag
}

export const CategoryIcon = ({ iconName, className = 'w-4 h-4', color }) => {
  const IconComponent = ICON_MAP[iconName] || Circle
  return <IconComponent className={className} style={color ? { color } : undefined} />
}

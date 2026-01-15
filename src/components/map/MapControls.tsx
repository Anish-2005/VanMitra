// src/components/map/MapControls.tsx
'use client';

import React from 'react';
import { Layers, Ruler, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useAtlasStore } from '@/stores/atlas-store';

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

interface MapControlsProps {
  onLayerToggle?: () => void;
  onMeasurementToggle?: () => void;
}

export function MapControls({ onLayerToggle, onMeasurementToggle }: MapControlsProps) {
  const {
    zoom,
    setZoom,
    setCenter,
    measurementMode,
    setMeasurementMode,
    reset,
  } = useAtlasStore();

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 20));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 0));
  const handleReset = () => {
    setCenter([78.9629, 20.5937]); // Center of India
    setZoom(5);
    reset();
  };

  const handleMeasurementToggle = () => {
    setMeasurementMode(!measurementMode);
    onMeasurementToggle?.();
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-px bg-gray-200 my-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-1 flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLayerToggle}
          className="h-8 w-8 p-0"
          aria-label="Toggle layers panel"
        >
          <Layers className="h-4 w-4" />
        </Button>

        <Button
          variant={measurementMode ? "default" : "ghost"}
          size="sm"
          onClick={handleMeasurementToggle}
          className="h-8 w-8 p-0"
          aria-label="Toggle measurement mode"
        >
          <Ruler className="h-4 w-4" />
        </Button>

        <div className="h-px bg-gray-200 my-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
          aria-label="Reset map view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
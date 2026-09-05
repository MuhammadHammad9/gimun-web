import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full p-10 sm:p-14 text-center rounded-2xl bg-[#F8F8FC] border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center justify-center text-[#5A5A6E]">
        {icon || <SearchX className="w-6 h-6 text-[#5A5A6E]" />}
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A1A2E]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#5A5A6E] leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EditorTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fill?: boolean;
}

const EditorTextarea = React.forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  ({ className, fill = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-[var(--radius-md)] border border-border bg-editor px-4 py-3 text-body leading-prose text-foreground shadow-app-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          fill && 'min-h-editor flex-1 resize-none',
          className,
        )}
        {...props}
      />
    );
  },
);
EditorTextarea.displayName = 'EditorTextarea';

export default EditorTextarea;

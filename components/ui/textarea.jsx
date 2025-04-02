import * as React from "react";
import { cn } from "./utils";

export const Textarea = ({ className, autoResize, maxHeight = 200, ...props }) => {
  const textareaRef = React.useRef(null);

  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange(e);
    }

    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [autoResize, maxHeight]);

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        autoResize && "overflow-hidden resize-none",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
};

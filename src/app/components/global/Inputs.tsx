import type React from "react";
import { forwardRef } from "react";

interface InputsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Inputs = forwardRef<HTMLInputElement, InputsProps>(
  ({ className = "", ...props }, ref) => {
    return <input ref={ref} {...props} className={className} />;
  }
);

Inputs.displayName = "Inputs";

export default Inputs;

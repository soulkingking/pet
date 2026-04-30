"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitLockContextValue = {
  locked: boolean;
  release: () => void;
};

const SubmitLockContext = React.createContext<SubmitLockContextValue | null>(null);

type DebouncedFormProps = Omit<React.ComponentPropsWithoutRef<"form">, "onSubmitCapture"> & {
  action: React.ComponentPropsWithoutRef<"form">["action"];
  onSubmitCapture?: React.FormEventHandler<HTMLFormElement>;
};

export function DebouncedForm({ action, onSubmitCapture, children, ...props }: DebouncedFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const hasSubmittedRef = React.useRef(false);
  const [locked, setLocked] = React.useState(false);

  const release = React.useCallback(() => {
    hasSubmittedRef.current = false;
    formRef.current?.removeAttribute("data-submitting");
    setLocked(false);
  }, []);

  function handleSubmitCapture(event: React.FormEvent<HTMLFormElement>) {
    if (hasSubmittedRef.current || event.currentTarget.dataset.submitting === "true") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    hasSubmittedRef.current = true;
    event.currentTarget.dataset.submitting = "true";
    setLocked(true);
    onSubmitCapture?.(event);
  }

  return (
    <SubmitLockContext.Provider value={{ locked, release }}>
      <form ref={formRef} action={action} onSubmitCapture={handleSubmitCapture} {...props}>
        {children}
        <SubmitLockReset />
      </form>
    </SubmitLockContext.Provider>
  );
}

export function DebouncedSubmitButton({
  children,
  disabled,
  pendingLabel,
  ...props
}: ButtonProps & {
  pendingLabel?: React.ReactNode;
}) {
  const status = useFormStatus();
  const lock = React.useContext(SubmitLockContext);
  const isSubmitting = status.pending || lock?.locked;

  return (
    <Button type="submit" disabled={disabled || isSubmitting} aria-busy={isSubmitting} {...props}>
      {status.pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

function SubmitLockReset() {
  const { pending } = useFormStatus();
  const lock = React.useContext(SubmitLockContext);
  const wasPendingRef = React.useRef(false);

  React.useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }

    if (wasPendingRef.current) {
      wasPendingRef.current = false;
      lock?.release();
    }
  }, [lock, pending]);

  return null;
}

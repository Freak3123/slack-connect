"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Modal = Dialog.Root;

export const ModalTrigger = Dialog.Trigger;

export const ModalPortal = Dialog.Portal;

export const ModalOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <Dialog.Overlay
    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
    {...props}
    ref={ref}
  />
));
ModalOverlay.displayName = "ModalOverlay";

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <Dialog.Portal>
    <ModalOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-lg -translate-x-[50%] -translate-y-[50%] overflow-auto rounded-lg bg-white p-6 shadow-lg focus:outline-none",
        "animate-fadeIn"
      )}
      {...props}
    />
  </Dialog.Portal>
));
ModalContent.displayName = Dialog.Content.displayName;

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

export const ModalTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>((props, ref) => (
  <Dialog.Title
    ref={ref}
    className="text-lg font-semibold leading-none tracking-tight"
    {...props}
  />
));
ModalTitle.displayName = Dialog.Title.displayName;

export const ModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>((props, ref) => (
  <Dialog.Description
    ref={ref}
    className="text-sm text-gray-500"
    {...props}
  />
));
ModalDescription.displayName = Dialog.Description.displayName;

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

export const ModalClose = React.forwardRef<
  React.ElementRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>((props, ref) => (
  <Dialog.Close
    ref={ref}
    className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
    {...props}
  >
    <X className="h-5 w-5" />
  </Dialog.Close>
));
ModalClose.displayName = Dialog.Close.displayName;

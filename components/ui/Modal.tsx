import React from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({
    open,
    onClose,
    children,
}: ModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0"
            style={{ pointerEvents: open ? "auto" : "none" }}
        >
            {/* Overlay */}
            <div
                className={`absolute inset-0 transition-all duration-300 ease-out
          ${open
                        ? "bg-black/20 backdrop-blur-sm opacity-100"
                        : "bg-black/0 backdrop-blur-0 opacity-0"
                    }`}
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Modal content */}
            <div
                className={`relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-2xl
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
          mobile:rounded-xl mobile:max-w-full mobile:p-2`}
                style={{ maxWidth: '95vw' }}
            >
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f3f4] text-2xl text-[#5f6368] transition hover:bg-[#e0e0e0] sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:text-base"
                    aria-label="Close"
                >
                    ×
                </button>

                {children}
            </div>
        </div>
    );
}
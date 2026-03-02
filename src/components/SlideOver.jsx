import { useEffect } from 'react'

export function SlideOver({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[1100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-[1200] w-full max-w-md transform bg-white shadow-2xl ring-1 ring-slate-900/5 transition-transform duration-300 ease-in-out sm:max-w-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

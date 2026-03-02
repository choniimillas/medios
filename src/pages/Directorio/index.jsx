import { useState } from 'react'

import { ClientesTab, AnunciantesTab } from './SimpleEntityTab'
import { LocadoresTab } from './LocadoresTab'

export function DirectorioPage() {
    const [activeTab, setActiveTab] = useState('clientes')

    const tabs = [
        { id: 'clientes', label: 'Clientes' },
        { id: 'anunciantes', label: 'Anunciantes' },
        { id: 'locadores', label: 'Locadores' },
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Directorio</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Tabs */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-6">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }
                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'clientes' && <ClientesTab />}
                    {activeTab === 'anunciantes' && <AnunciantesTab />}
                    {activeTab === 'locadores' && <LocadoresTab />}
                </div>
            </div>
        </div>
    )
}

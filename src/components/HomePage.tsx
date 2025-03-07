import React from 'react';
import { FileText, Home, Settings } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: 'mandates' | 'estimations' | 'settings') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-[#0b8043] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white">2R FUSION</h1>
          <nav className="space-x-6">
            <button
              onClick={() => onNavigate('estimations')}
              className="text-white hover:text-[#097339] transition-colors"
            >
              Estimations
            </button>
            <button
              onClick={() => onNavigate('mandates')}
              className="text-white hover:text-[#097339] transition-colors"
            >
              Mandats
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="text-white hover:text-[#097339] transition-colors"
            >
              <Settings className="h-6 w-6" />
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Bienvenue sur votre espace de gestion
          </h2>
          <p className="text-lg text-gray-600">
            Gérez vos mandats et estimations en toute simplicité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Estimations Card */}
          <div
            onClick={() => onNavigate('estimations')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
          >
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#0b8043] bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0b8043] transition-colors">
                <FileText className="h-8 w-8 text-[#0b8043] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Estimations</h3>
              <p className="text-gray-600 text-center">
                Réalisez des estimations détaillées et générez des rapports professionnels.
              </p>
            </div>
          </div>

          {/* Mandats Card */}
          <div
            onClick={() => onNavigate('mandates')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
          >
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#0b8043] bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0b8043] transition-colors">
                <Home className="h-8 w-8 text-[#0b8043] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Mandats</h3>
              <p className="text-gray-600 text-center">
                Gérez vos mandats de vente et générez les documents officiels.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm text-gray-500">
          <span>2R IMMOBILIER</span>
          <span className="mx-2">•</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

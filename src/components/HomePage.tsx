import React from 'react';
import { FileText, Home, Settings } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: 'mandates' | 'estimations' | 'settings') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0b8043] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">2R FUSION</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onNavigate('estimations')}
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-[#097339]"
              >
                Estimations
              </button>
              <button
                onClick={() => onNavigate('mandates')}
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-[#097339]"
              >
                Mandats
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="px-4 py-2 rounded-lg transition-colors text-white hover:bg-[#097339]"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue sur votre espace de gestion
          </h2>
          <p className="text-lg text-gray-600">
            Gérez vos mandats et estimations en toute simplicité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estimations Card */}
          <div 
            onClick={() => onNavigate('estimations')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-[#0b8043] bg-opacity-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0b8043] transition-colors">
                <FileText className="h-6 w-6 text-[#0b8043] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Estimations</h3>
              <p className="text-gray-600">
                Réalisez des estimations détaillées et générez des rapports professionnels.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-sm font-medium text-[#0b8043] group-hover:text-[#097339] transition-colors">
                →
              </span>
            </div>
          </div>

          {/* Mandats Card */}
          <div 
            onClick={() => onNavigate('mandates')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-[#0b8043] bg-opacity-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0b8043] transition-colors">
                <Home className="h-6 w-6 text-[#0b8043] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mandats</h3>
              <p className="text-gray-600">
                Gérez vos mandats de vente, suivez leur évolution et générez les documents.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-sm font-medium text-[#0b8043] group-hover:text-[#097339] transition-colors">
                →
              </span>
            </div>
          </div>
        </div>

        <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center text-sm text-gray-500">
              <span>2R IMMOBILIER</span>
              <span className="mx-2">•</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
import React from 'react';

interface Tab {
  id: number;
  name: string;
}

interface EstimationTabsProps {
  tabs: Tab[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function EstimationTabs({ tabs, currentStep, setCurrentStep }: EstimationTabsProps) {
  // Handle tab click without submitting the form
  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tabId: number) => {
    e.preventDefault(); // Prevent default button behavior
    setCurrentStep(tabId);
  };

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button" // Explicitly set type to button to prevent form submission
              onClick={(e) => handleTabClick(e, tab.id)}
              className={`
                whitespace-nowrap py-2 px-3 text-sm font-medium rounded-t-lg transition-colors duration-200
                ${currentStep === tab.id
                  ? 'border-b-2 border-primary text-primary bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-current={currentStep === tab.id ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {/* Progress bar removed as requested */}
    </div>
  );
}
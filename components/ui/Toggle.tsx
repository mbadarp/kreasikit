
import React from 'react';

interface ToggleProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  helperText?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, setEnabled, helperText }) => {
  return (
    <div>
        <div className="flex items-center">
        <button
            type="button"
            className={`${
            enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900`}
            onClick={() => setEnabled(!enabled)}
        >
            <span
            className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
        </button>
        <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        </div>
        {helperText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Toggle;

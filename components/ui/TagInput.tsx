
import React, { useState } from 'react';
import { XIcon } from '../icons/XIcon';

interface TagInputProps {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags, placeholder, helperText }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap items-center w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white">
        {tags.map(tag => (
          <span key={tag} className="flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 -mr-1 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-500 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:bg-primary-500 focus:text-white"
            >
              <span className="sr-only">Remove {tag}</span>
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
       {helperText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default TagInput;
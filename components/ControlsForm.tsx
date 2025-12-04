import React, { useState, useEffect } from 'react';
import { AspectRatio, BodyType, Style, ImageGenerationOptions, Gender } from '../types';
import { ASPECT_RATIOS, BODY_TYPE_DETAILS, STYLES, GENDERS, DEFAULT_GENDER } from '../constants';

interface ControlsFormProps {
  initialOptions: ImageGenerationOptions;
  onGenerate: (options: ImageGenerationOptions, outputCount: number) => void;
  isGenerating: boolean;
  uploadedImageBase64: string | null;
  initialOutputCount: number;
}

const ControlsForm: React.FC<ControlsFormProps> = ({
  initialOptions,
  onGenerate,
  isGenerating,
  uploadedImageBase64,
  initialOutputCount,
}) => {
  const [prompt, setPrompt] = useState<string>(initialOptions.prompt);
  const [bodyType, setBodyType] = useState<BodyType>(initialOptions.bodyType);
  const [style, setStyle] = useState<Style>(initialOptions.style);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialOptions.aspectRatio);
  const [customWeightPounds, setCustomWeightPounds] = useState<number | ''>(initialOptions.customWeightPounds || '');
  const [gender, setGender] = useState<Gender>(initialOptions.gender || DEFAULT_GENDER);
  const [outputCount, setOutputCount] = useState<number>(initialOutputCount);

  // Update form states when initialOptions change (e.g., when editing a generated image)
  useEffect(() => {
    setPrompt(initialOptions.prompt);
    setBodyType(initialOptions.bodyType);
    setStyle(initialOptions.style);
    setAspectRatio(initialOptions.aspectRatio);
    setCustomWeightPounds(initialOptions.customWeightPounds || '');
    setGender(initialOptions.gender || DEFAULT_GENDER);
  }, [initialOptions]);

  // Update outputCount state when initialOutputCount changes
  useEffect(() => {
    setOutputCount(initialOutputCount);
  }, [initialOutputCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(
      {
        prompt,
        bodyType,
        style,
        aspectRatio,
        customWeightPounds: customWeightPounds !== '' ? Number(customWeightPounds) : undefined,
        gender: gender !== Gender.UNSPECIFIED ? gender : undefined,
      },
      outputCount,
    );
  };

  const isFormValid = uploadedImageBase64 !== null && prompt.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-white rounded-lg shadow-lg flex flex-col gap-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Image Editing Controls</h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="prompt" className="font-semibold text-gray-700">Prompt:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y text-gray-900 bg-white"
          placeholder="e.g., 'Add a retro filter', 'Change background to a futuristic city'"
          required
          aria-label="Image editing prompt"
        ></textarea>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body-type" className="font-semibold text-gray-700">Body Type:</label>
        <select
          id="body-type"
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value as BodyType)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          aria-label="Select body type"
        >
          {Object.values(BodyType).map((type) => (
            <option key={type} value={type}>
              {BODY_TYPE_DETAILS[type].label} {BODY_TYPE_DETAILS[type].weightRange ? `(${BODY_TYPE_DETAILS[type].weightRange})` : ''}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 italic">
          {BODY_TYPE_DETAILS[bodyType].description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="gender" className="font-semibold text-gray-700">Gender (Optional):</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          aria-label="Select gender for the subject"
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="custom-weight" className="font-semibold text-gray-700">Custom Weight (Pounds, Optional):</label>
        <input
          id="custom-weight"
          type="number"
          value={customWeightPounds}
          onChange={(e) => setCustomWeightPounds(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="e.g., 150"
          min="1"
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          aria-label="Enter custom weight in pounds"
        />
        <p className="text-sm text-gray-500 italic">
          Enter a specific weight to guide the model. This will be explicitly kept.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="style" className="font-semibold text-gray-700">Style:</label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value as Style)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          aria-label="Select generation style"
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="aspect-ratio" className="font-semibold text-gray-700">Aspect Ratio:</label>
        <select
          id="aspect-ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          aria-label="Select aspect ratio"
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio} value={ratio}>
              {ratio}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="output-count" className="font-semibold text-gray-700">Number of Outputs: {outputCount}</label>
        <input
          id="output-count"
          type="range"
          min="1"
          max="4"
          value={outputCount}
          onChange={(e) => setOutputCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={outputCount}
          aria-label="Number of images to generate"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span>4</span>
        </div>
      </div>

      <button
        type="submit"
        className={`w-full py-3 px-6 rounded-md text-white font-bold text-lg transition-colors duration-300
          ${isFormValid && !isGenerating
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            : 'bg-gray-400 cursor-not-allowed'
          }`}
        disabled={isGenerating || !isFormValid}
        aria-disabled={isGenerating || !isFormValid}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          `Generate ${outputCount} Images`
        )}
      </button>

      {!uploadedImageBase64 && (
        <p className="text-red-500 text-sm mt-2 text-center" role="alert">Please upload a primary reference image to enable generation.</p>
      )}
    </form>
  );
};

export default ControlsForm;
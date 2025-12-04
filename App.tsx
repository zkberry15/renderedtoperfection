import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageUpload from './components/ImageUpload';
import ControlsForm from './components/ControlsForm';
import GeneratedImageCard from './components/GeneratedImageCard';
import ImageModal from './components/ImageModal';
import { AspectRatio, BodyType, Style, ImageGenerationOptions, GeneratedImage, Gender } from './types';
import {
  DEFAULT_GENERATION_COUNT,
  DEFAULT_STYLE,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_BODY_TYPE,
  DEFAULT_GENDER,
} from './constants';
import { generateEditedImage, checkApiKeyStatus, openApiKeySelection } from './services/geminiService';
import { downloadImage, copyImageToClipboard, shareImage } from './utils/imageUtils'; // Import shareImage

// --- Generation Limit Constants ---
constconst FREE_LIMIT = 30;
const PAID_LIMIT = 100;

function getDailyLimit(user: any) {
  if (user?.plan === "paid") return PAID_LIMIT;
  return FREE_LIMIT;
}
const LOCAL_STORAGE_KEY_COUNT = 'generationCount';
const LOCAL_STORAGE_KEY_DATE = 'lastResetDate';

const App: React.FC = () => {
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageFileName, setUploadedImageFileName] = useState<string | null>(null);
  const [secondUploadedImageBase64, setSecondUploadedImageBase64] = useState<string | null>(null);
  const [secondUploadedImageFileName, setSecondUploadedImageFileName] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [initialOptions, setInitialOptions] = useState<ImageGenerationOptions>({
    prompt: '',
    bodyType: DEFAULT_BODY_TYPE,
    style: DEFAULT_STYLE,
    aspectRatio: DEFAULT_ASPECT_RATIO,
    customWeightPounds: undefined,
    gender: DEFAULT_GENDER,
  });
  const [outputCount, setOutputCount] = useState<number>(DEFAULT_GENERATION_COUNT);
  const [currentGenerationResults, setCurrentGenerationResults] = useState<GeneratedImage[]>([]);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null);
  const [generationTodayCount, setGenerationTodayCount] = useState<number>(0);

  // --- API Key Check ---
  const checkKey = useCallback(async () => {
    const hasKey = await checkApiKeyStatus();
    setApiKeySelected(hasKey);
    if (!hasKey) {
      // Small delay to allow initial render before opening dialog
      setTimeout(async () => {
        await openApiKeySelection();
        // Assuming selection was successful, update state.
        // The actual API call will re-check if key is valid.
        setApiKeySelected(true);
      }, 500);
    }
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  // --- Generation Limit Logic ---
  const getTodayEstMidnight = (): number => {
    const now = new Date();

    // Get the date part (MM/DD/YYYY) as observed in 'America/New_York' timezone.
    const estDateString = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'America/New_York',
    }).format(now);

    // Construct a new Date object representing 00:00:00 (midnight)
    // on that specific date in the 'America/New_York' timezone.
    // The Date constructor will correctly interpret this string and
    // set its internal UTC timestamp accordingly, handling DST.
    const estMidnight = new Date(`${estDateString} 00:00:00 America/New_York`);

    return estMidnight.getTime();
  };

  const loadGenerationData = useCallback(() => {
    const storedCount = localStorage.getItem(LOCAL_STORAGE_KEY_COUNT);
    const storedDate = localStorage.getItem(LOCAL_STORAGE_KEY_DATE);
    const todayMidnight = getTodayEstMidnight();

    if (storedCount && storedDate) {
      const lastResetDate = parseInt(storedDate, 10);
      if (lastResetDate < todayMidnight) {
        // New day, reset count
        localStorage.setItem(LOCAL_STORAGE_KEY_COUNT, '0');
        localStorage.setItem(LOCAL_STORAGE_KEY_DATE, todayMidnight.toString());
        setGenerationTodayCount(0);
      } else {
        setGenerationTodayCount(parseInt(storedCount, 10));
      }
    } else {
      // No data, initialize
      localStorage.setItem(LOCAL_STORAGE_KEY_COUNT, '0');
      localStorage.setItem(LOCAL_STORAGE_KEY_DATE, todayMidnight.toString());
      setGenerationTodayCount(0);
    }
  }, []);

  useEffect(() => {
    loadGenerationData();
  }, [loadGenerationData]);

  const incrementGenerationCount = useCallback(() => {
    setGenerationTodayCount(prevCount => {
      const newCount = prevCount + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY_COUNT, newCount.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_DATE, getTodayEstMidnight().toString());
      return newCount;
    });
  }, []);

  const generationsRemaining = generationCount >= getDailyLimit(user)


  // --- Initialize Current Generation Results ---
  useEffect(() => {
    // Initialize currentGenerationResults when outputCount changes or on initial load
    if (currentGenerationResults.length !== outputCount || (currentGenerationResults.length === 0 && outputCount > 0)) {
        setCurrentGenerationResults(
            Array.from({ length: outputCount }, () => ({
                id: uuidv4(),
                url: null,
                isLoading: false,
                error: null,
                optionsUsed: initialOptions,
                originalImageBase64: uploadedImageBase64 || '',
            }))
        );
    }
}, [outputCount, uploadedImageBase64, initialOptions]);


  // --- Image Upload Handlers ---
  const handlePrimaryImageSelect = (base64Image: string, fileName: string) => {
    setUploadedImageBase64(base64Image);
    setUploadedImageFileName(fileName);
  };

  const handleSecondImageSelect = (base64Image: string, fileName: string) => {
    setSecondUploadedImageBase64(base64Image);
    setSecondUploadedImageFileName(fileName);
  };

  // --- Delete Reference Image Handlers ---
  const handleDeletePrimaryReferenceImage = () => {
    setUploadedImageBase64(null);
    setUploadedImageFileName(null);
    setCurrentGenerationResults(
      Array.from({ length: outputCount }, () => ({
        id: uuidv4(),
        url: null,
        isLoading: false,
        error: null,
        optionsUsed: initialOptions,
        originalImageBase64: '',
      }))
    );
  };

  const handleDeleteSecondReferenceImage = () => {
    setSecondUploadedImageBase64(null);
    setSecondUploadedImageFileName(null);
  };

  // --- Image Generation Handler ---
  const handleGenerate = async (options: ImageGenerationOptions, count: number) => {
    if (!uploadedImageBase64) {
      alert('Please upload a primary reference image first.');
      return;
    }

    if (!apiKeySelected) {
      await openApiKeySelection();
      setApiKeySelected(true);
      return;
    }

    if (generationTodayCount >= MAX_GENERATIONS_PER_DAY 30) {
      alert(`Daily generation limit reached (${MAX_GENERATIONS_PER_DAY}). Please try again tomorrow.`);
      return;
    }

    setInitialOptions(options);
    setOutputCount(count);

    // Prepare currentGenerationResults array for loading states
    setCurrentGenerationResults(
      Array.from({ length: count }, () => ({
        id: uuidv4(),
        url: null,
        isLoading: true,
        error: null,
        optionsUsed: options,
        originalImageBase64: uploadedImageBase64!,
      }))
    );
    setIsGenerating(true);

    const generationPromises = Array.from({ length: count }).map(async (_, index) => {
      // Check limit before starting each individual generation within the batch
      // This is a safety check; the main check is above.
      if (generationTodayCount + index >= MAX_GENERATIONS_PER_DAY) {
        return { id: uuidv4(), url: null, isLoading: false, error: "Daily generation limit reached.", optionsUsed: options, originalImageBase64: uploadedImageBase64! };
      }

      const tempId = uuidv4();
      try {
        const imageUrl = await generateEditedImage(uploadedImageBase64!, options, secondUploadedImageBase64);
        incrementGenerationCount(); // Increment count for each successful generation
        return { id: tempId, url: imageUrl, isLoading: false, error: null, optionsUsed: options, originalImageBase64: uploadedImageBase64! };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        if (errorMessage.includes("API key") || errorMessage.includes("not found") || errorMessage.includes("Requested entity was not found.")) {
          alert(`API Key error: ${errorMessage}. Please re-select your API key.`);
          setApiKeySelected(false);
          await openApiKeySelection();
        }
        return { id: tempId, url: null, isLoading: false, error: `Generation failed: ${errorMessage}`, optionsUsed: options, originalImageBase64: uploadedImageBase64! };
      }
    });

    const results = await Promise.allSettled(generationPromises);

    setCurrentGenerationResults(prevImages => {
      const newResults = results.map((result, index) => {
        const baseImage = prevImages[index] || { id: uuidv4(), url: null, isLoading: false, error: null, optionsUsed: options, originalImageBase64: uploadedImageBase64! };

        if (result.status === 'fulfilled') {
          return { ...baseImage, ...result.value };
        } else {
          return { ...baseImage, isLoading: false, error: `Generation failed: ${result.reason?.message || 'Unknown error.'}` };
        }
      });

      const successfulGenerations = newResults.filter(img => img.url !== null);
      if (successfulGenerations.length > 0) {
        setImageHistory(prevHistory => [...prevHistory, ...successfulGenerations]);
      }
      return newResults;
    });
    setIsGenerating(false);
    loadGenerationData(); // Reload data to reflect latest count
  };

  // --- Image Action Handlers ---
  const handleSaveImage = (imageUrl: string) => {
    downloadImage(imageUrl, `edited_${initialOptions.prompt.substring(0, 20).replace(/\s/g, '_') || 'image'}.png`);
  };

  const handleCopyImage = async (imageUrl: string) => {
    await copyImageToClipboard(imageUrl);
    alert('Image copied to clipboard!');
  };

  const handleShareImage = async (imageUrl: string, filename: string) => {
    await shareImage(imageUrl, filename);
  }

  const handleEditGeneratedImage = (image: GeneratedImage) => {
    setUploadedImageBase64(image.originalImageBase64);
    setUploadedImageFileName(`re_editing_${image.id.substring(0, 5)}.png`);
    setInitialOptions(image.optionsUsed);
    setCurrentGenerationResults(
      Array.from({ length: outputCount }, () => ({
        id: uuidv4(),
        url: null,
        isLoading: false,
        error: null,
        optionsUsed: image.optionsUsed,
        originalImageBase64: image.originalImageBase64,
      }))
    );
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImageForModal(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-gray-900">
      {/* Sidebar for Controls and Upload */}
      <aside className="w-full lg:w-1/3 p-4 lg:p-6 bg-white border-b lg:border-r border-gray-300 shadow-lg flex flex-col gap-6 lg:overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-4">Nano Banana Image Editor</h1>
        
        {/* Image Uploads */}
        <div className="flex flex-col gap-4">
          <ImageUpload
            label="Primary Reference Image"
            onImageSelect={handlePrimaryImageSelect}
            uploadedImagePreview={uploadedImageBase64}
            onDelete={uploadedImageBase64 ? handleDeletePrimaryReferenceImage : undefined}
          />
          <ImageUpload
            label="Optional Second Reference Image"
            onImageSelect={handleSecondImageSelect}
            uploadedImagePreview={secondUploadedImageBase64}
            onDelete={secondUploadedImageBase64 ? handleDeleteSecondReferenceImage : undefined}
          />
        </div>

        <ControlsForm
          initialOptions={initialOptions}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          uploadedImageBase64={uploadedImageBase64}
          initialOutputCount={outputCount}
        />
        {!apiKeySelected && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
              <p className="font-bold">API Key Required</p>
              <p>Please select a paid API key for image generation. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more about billing.</a></p>
            </div>
          )}
        {generationTodayCount < MAX_GENERATIONS_PER_DAY 30 (
          <p className="text-sm text-center text-gray-600">
            Generations today: {generationTodayCount}/{MAX_GENERATIONS_PER_DAY} (Remaining: {generationsRemaining})
          </p>
        ) : (
          <p className="text-sm text-center text-red-600 font-semibold">
            Daily generation limit reached ({MAX_GENERATIONS_PER_DAY}). Resets at 12:00 AM America/New_York.
          </p>
        )}
      </aside>

      {/* Main Content Area for Generated Images */}
      <main className="flex-1 w-full p-4 lg:p-8 flex flex-col"> {/* Added w-full for small screens */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Generated Images</h2>
        {uploadedImageBase64 && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-center flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Reference Images</h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-blue-400"> {/* Removed sm:w-64 sm:h-64 for consistent sizing */}
                <img src={uploadedImageBase64} alt="Primary Reference" className="object-contain w-full h-full" />
                <p className="text-xs text-gray-600 mt-1">Primary: {uploadedImageFileName}</p>
              </div>
              {secondUploadedImageBase64 && (
                <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-blue-400"> {/* Removed sm:w-64 sm:h-64 for consistent sizing */}
                  <img src={secondUploadedImageBase64} alt="Secondary Reference" className="object-contain w-full h-full" />
                  <p className="text-xs text-gray-600 mt-1">Optional: {secondUploadedImageFileName}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 flex-grow">
          {currentGenerationResults.map((image) => (
            <GeneratedImageCard
              key={image.id}
              image={image}
              onSave={handleSaveImage}
              onCopy={handleCopyImage}
              onShare={handleShareImage} // Pass new share handler
              onEdit={handleEditGeneratedImage}
              onImageClick={handleImageClick}
            />
          ))}
        </div>

        {/* Image History Section */}
        <div className="mt-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
            Image History
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label={showHistory ? 'Hide image history' : `Show image history (${imageHistory.length} items)`}
            >
              {showHistory ? 'Hide History' : `Show History (${imageHistory.length})`}
            </button>
          </h2>
          {showHistory && imageHistory.length === 0 && (
            <p className="text-center text-gray-600 p-4">No images in history yet. Generate some images to see them here!</p>
          )}
          {showHistory && imageHistory.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50">
              {imageHistory.map((image) => (
                <GeneratedImageCard
                  key={image.id}
                  image={image}
                  onSave={handleSaveImage}
                  onCopy={handleCopyImage}
                  onShare={handleShareImage} // Pass new share handler
                  onEdit={handleEditGeneratedImage}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Image Modal */}
      {selectedImageForModal && (
        <ImageModal imageUrl={selectedImageForModal} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;
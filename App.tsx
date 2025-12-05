  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row">
        {/* Sidebar for Controls and Upload */}
        <aside className="w-full lg:w-1/3 p-4 lg:p-6 bg-white border-b lg:border-r border-gray-300 shadow-lg flex flex-col gap-6 lg:overflow-y-auto">
          <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-4">
            Nano Banana Image Editor
          </h1>

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
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
              role="alert"
            >
              <p className="font-bold">API Key Required</p>
              <p>
                Please select a paid API key for image generation.{" "}
                <a
                  href="https://ai.google.dev/gemini-api/docs/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Learn more about billing.
                </a>
              </p>
            </div>
          )}

          {generationTodayCount < MAX_GENERATIONS_PER_DAY ? (
            <p className="text-sm text-center text-gray-600">
              Generations today: {generationTodayCount}/{MAX_GENERATIONS_PER_DAY} (Remaining:{" "}
              {generationsRemaining})
            </p>
          ) : (
            <p className="text-sm text-center text-red-600 font-semibold">
              Daily generation limit reached ({MAX_GENERATIONS_PER_DAY}). Resets at 12:00 AM
              America/New_York.
            </p>
          )}
        </aside>

        {/* Main Content Area for Generated Images */}
        <main className="flex-1 w-full p-4 lg:p-8 flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Generated Images
          </h2>
          {uploadedImageBase64 && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-center flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Current Reference Images
              </h3>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden border-2 border-blue-400">
                  <img
                    src={uploadedImageBase64}
                    alt="Primary Reference"
                    className="object-contain w-full h-full"
                  />
                  <p className="text-xs text-gray-600 mt-1">Primary: {uploadedImageFileName}</p>
                </div>
                {secondUploadedImageBase64 && (
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden border-2 border-blue-400">
                    <img
                      src={secondUploadedImageBase64}
                      alt="Secondary Reference"
                      className="object-contain w-full h-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Optional: {secondUploadedImageFileName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 flex-grow">
            {currentGenerationResults.map(image => (
              <GeneratedImageCard
                key={image.id}
                image={image}
                onSave={handleSaveImage}
                onCopy={handleCopyImage}
                onShare={handleShareImageWrapper}
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
                aria-label={
                  showHistory
                    ? "Hide image history"
                    : `Show image history (${imageHistory.length} items)`
                }
              >
                {showHistory ? "Hide History" : `Show History (${imageHistory.length})`}
              </button>
            </h2>
            {showHistory && imageHistory.length === 0 && (
              <p className="text-center text-gray-600 p-4">
                No images in history yet. Generate some images to see them here!
              </p>
            )}
            {showHistory && imageHistory.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50">
                {imageHistory.map(image => (
                  <GeneratedImageCard
                    key={image.id}
                    image={image}
                    onSave={handleSaveImage}
                    onCopy={handleCopyImage}
                    onShare={handleShareImageWrapper}
                    onEdit={handleEditGeneratedImage}
                    onImageClick={handleImageClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedImageForModal && (
          <ImageModal imageUrl={selectedImageForModal} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );

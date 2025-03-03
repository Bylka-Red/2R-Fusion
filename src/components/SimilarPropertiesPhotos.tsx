import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { ComparablePhoto } from '../types';

interface SimilarPropertiesPhotosProps {
  photos: ComparablePhoto[];
  onPhotosChange: (photos: ComparablePhoto[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export function SimilarPropertiesPhotos({
  photos,
  onPhotosChange,
  onNext,
  onPrevious,
  onCancel,
}: SimilarPropertiesPhotosProps) {
  const [dragActive, setDragActive] = useState(false);
  const [tempPhotos, setTempPhotos] = useState<ComparablePhoto[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    const newPhotos = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      description: '',
      type: 'forSale' as const
    }));

    setTempPhotos(prev => [...prev, ...newPhotos].slice(0, 4 - photos.length));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removePhoto = (index: number, isTemp: boolean) => {
    if (isTemp) {
      const newTempPhotos = [...tempPhotos];
      URL.revokeObjectURL(newTempPhotos[index].preview);
      newTempPhotos.splice(index, 1);
      setTempPhotos(newTempPhotos);
    } else {
      const newPhotos = [...photos];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      onPhotosChange(newPhotos);
    }
  };

  const updatePhotoDescription = (index: number, description: string, isTemp: boolean) => {
    if (isTemp) {
      const newTempPhotos = [...tempPhotos];
      newTempPhotos[index] = { ...newTempPhotos[index], description };
      setTempPhotos(newTempPhotos);
    } else {
      const newPhotos = [...photos];
      newPhotos[index] = { ...newPhotos[index], description };
      onPhotosChange(newPhotos);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    // Combine existing photos with temp photos
    const allPhotos = [...photos, ...tempPhotos];
    onPhotosChange(allPhotos);
    onNext();
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    onPrevious();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Ajouter 4 Photos de biens similaires
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Ces photos nous aideront à comparer votre bien avec des propriétés similaires.
        </p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive 
            ? 'border-[#0b8043] bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={photos.length + tempPhotos.length >= 4}
        />
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <Upload className={`h-10 w-10 ${photos.length + tempPhotos.length >= 4 ? 'text-gray-400' : 'text-[#0b8043]'}`} />
          </div>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-[#0b8043] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0b8043] focus-within:ring-offset-2 hover:text-[#097339]"
            >
              <span>Téléchargez des photos</span>
            </label>
            <p className="pl-1">ou glissez-déposez</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
        </div>
      </div>

      {(photos.length > 0 || tempPhotos.length > 0) && (
        <div className="mt-8 grid grid-cols-2 gap-6">
          {photos.map((photo, index) => (
            <div key={`existing-${index}`} className="relative">
              <div className="group aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.preview}
                  alt={photo.description}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index, false)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={photo.description}
                  onChange={(e) => updatePhotoDescription(index, e.target.value, false)}
                  placeholder="Description de la photo"
                  className="w-full"
                />
              </div>
            </div>
          ))}
          
          {tempPhotos.map((photo, index) => (
            <div key={`temp-${index}`} className="relative">
              <div className="group aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.preview}
                  alt={photo.description}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index, true)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={photo.description}
                  onChange={(e) => updatePhotoDescription(index, e.target.value, true)}
                  placeholder="Description de la photo"
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && tempPhotos.length === 0 && (
        <div className="mt-8 text-center py-12 border rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune photo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter des photos de biens similaires
          </p>
        </div>
      )}
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
        >
          Précédent
        </button>
        <div>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
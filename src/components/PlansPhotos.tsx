import React, { useCallback, useState } from 'react';
import { Upload, X, Map, FileText } from 'lucide-react';
import type { ComparablePhoto } from '../types';

interface PlansPhotosProps {
  photos: ComparablePhoto[];
  onPhotosChange: (photos: ComparablePhoto[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export function PlansPhotos({
  photos,
  onPhotosChange,
  onNext,
  onPrevious,
  onCancel,
}: PlansPhotosProps) {
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
      type: photos.length === 0 ? 'plan' : 'cadastre' as const
    }));

    setTempPhotos(prev => [...prev, ...newPhotos].slice(0, 2 - photos.length));
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

  const existingPlanPhoto = photos.find(p => p.type === 'plan');
  const existingCadastrePhoto = photos.find(p => p.type === 'cadastre');
  const tempPlanPhoto = tempPhotos.find(p => p.type === 'plan');
  const tempCadastrePhoto = tempPhotos.find(p => p.type === 'cadastre');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Plans du bien
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Ajoutez le plan Maps et le plan cadastral du bien.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Plan Maps</h3>
          </div>
          {!existingPlanPhoto && !tempPlanPhoto ? (
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
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={photos.length + tempPhotos.length >= 2}
              />
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Map className="h-10 w-10 text-[#0b8043]" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-[#0b8043]">Cliquez pour ajouter</span> ou glissez le plan Maps
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="group aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={existingPlanPhoto ? existingPlanPhoto.preview : tempPlanPhoto?.preview}
                  alt="Plan Maps"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (existingPlanPhoto) {
                      removePhoto(photos.indexOf(existingPlanPhoto), false);
                    } else if (tempPlanPhoto) {
                      removePhoto(tempPhotos.indexOf(tempPlanPhoto), true);
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={existingPlanPhoto ? existingPlanPhoto.description : tempPlanPhoto?.description || ''}
                  onChange={(e) => {
                    if (existingPlanPhoto) {
                      updatePhotoDescription(photos.indexOf(existingPlanPhoto), e.target.value, false);
                    } else if (tempPlanPhoto) {
                      updatePhotoDescription(tempPhotos.indexOf(tempPlanPhoto), e.target.value, true);
                    }
                  }}
                  placeholder="Description du plan Maps"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Plan Cadastral</h3>
          </div>
          {!existingCadastrePhoto && !tempCadastrePhoto ? (
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
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={photos.length + tempPhotos.length >= 2}
              />
              <div className="space-y-2">
                <div className="flex justify-center">
                  <FileText className="h-10 w-10 text-[#0b8043]" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-[#0b8043]">Cliquez pour ajouter</span> ou glissez le plan cadastral
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="group aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={existingCadastrePhoto ? existingCadastrePhoto.preview : tempCadastrePhoto?.preview}
                  alt="Plan Cadastral"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (existingCadastrePhoto) {
                      removePhoto(photos.indexOf(existingCadastrePhoto), false);
                    } else if (tempCadastrePhoto) {
                      removePhoto(tempPhotos.indexOf(tempCadastrePhoto), true);
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={existingCadastrePhoto ? existingCadastrePhoto.description : tempCadastrePhoto?.description || ''}
                  onChange={(e) => {
                    if (existingCadastrePhoto) {
                      updatePhotoDescription(photos.indexOf(existingCadastrePhoto), e.target.value, false);
                    } else if (tempCadastrePhoto) {
                      updatePhotoDescription(tempPhotos.indexOf(tempCadastrePhoto), e.target.value, true);
                    }
                  }}
                  placeholder="Description du plan cadastral"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
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
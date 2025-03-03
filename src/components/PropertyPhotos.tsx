import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, Map, FileText, Image as ImageIcon } from 'lucide-react';
import type { ComparablePhoto } from '../types';

interface PropertyPhotosProps {
  photos: {
    url: string;
    description: string;
  }[];
  onPhotosChange: (photos: {
    url: string;
    description: string;
  }[]) => void;
  comparablePhotos: ComparablePhoto[];
  onComparablePhotosChange: (photos: ComparablePhoto[]) => void;
  forSalePhotos: ComparablePhoto[];
  onForSalePhotosChange: (photos: ComparablePhoto[]) => void;
  planPhotos: ComparablePhoto[];
  onPlanPhotosChange: (photos: ComparablePhoto[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
}

export function PropertyPhotos({
  photos,
  onPhotosChange,
  comparablePhotos,
  onComparablePhotosChange,
  forSalePhotos,
  onForSalePhotosChange,
  planPhotos,
  onPlanPhotosChange,
  onNext,
  onPrevious,
  onCancel,
}: PropertyPhotosProps) {
  const [dragActive, setDragActive] = useState(false);
  const [tempPhotos, setTempPhotos] = useState<{
    file: File;
    preview: string;
    description: string;
    type: 'property';
  }[]>([]);
  const [tempComparablePhotos, setTempComparablePhotos] = useState<ComparablePhoto[]>([]);
  const [tempForSalePhotos, setTempForSalePhotos] = useState<ComparablePhoto[]>([]);
  const [tempPlanPhotos, setTempPlanPhotos] = useState<ComparablePhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For drag and drop between categories
  const [draggedPhoto, setDraggedPhoto] = useState<{
    photo: any;
    sourceCategory: 'property' | 'comparable' | 'forSale' | 'plan';
    index: number;
    isTemp: boolean;
  } | null>(null);

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

    // Distribute files based on current counts
    let propertyCount = photos.length + tempPhotos.length;
    let comparableCount = comparablePhotos.length + tempComparablePhotos.length;
    let forSaleCount = forSalePhotos.length + tempForSalePhotos.length;
    let planCount = planPhotos.length + tempPlanPhotos.length;

    const newPropertyPhotos: {file: File; preview: string; description: string; type: 'property'}[] = [];
    const newComparablePhotos: ComparablePhoto[] = [];
    const newForSalePhotos: ComparablePhoto[] = [];
    const newPlanPhotos: ComparablePhoto[] = [];

    validFiles.forEach(file => {
      const preview = URL.createObjectURL(file);
      
      // Prioritize filling categories that need photos
      if (propertyCount < 1) {
        newPropertyPhotos.push({
          file,
          preview,
          description: '',
          type: 'property'
        });
        propertyCount++;
      } else if (comparableCount < 4) {
        newComparablePhotos.push({
          file,
          preview,
          description: '',
          type: 'sold'
        });
        comparableCount++;
      } else if (forSaleCount < 4) {
        newForSalePhotos.push({
          file,
          preview,
          description: '',
          type: 'forSale'
        });
        forSaleCount++;
      } else if (planCount < 2) {
        newPlanPhotos.push({
          file,
          preview,
          description: '',
          type: planCount === 0 ? 'plan' : 'cadastre'
        });
        planCount++;
      }
    });

    setTempPhotos(prev => [...prev, ...newPropertyPhotos]);
    setTempComparablePhotos(prev => [...prev, ...newComparablePhotos]);
    setTempForSalePhotos(prev => [...prev, ...newForSalePhotos]);
    setTempPlanPhotos(prev => [...prev, ...newPlanPhotos]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removePhoto = (index: number, isTemp: boolean, section: 'property' | 'comparable' | 'forSale' | 'plan') => {
    if (section === 'property') {
      if (isTemp) {
        const newTempPhotos = [...tempPhotos];
        URL.revokeObjectURL(newTempPhotos[index].preview);
        newTempPhotos.splice(index, 1);
        setTempPhotos(newTempPhotos);
      } else {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        onPhotosChange(newPhotos);
      }
    } else if (section === 'comparable') {
      if (isTemp) {
        const newTempPhotos = [...tempComparablePhotos];
        URL.revokeObjectURL(newTempPhotos[index].preview);
        newTempPhotos.splice(index, 1);
        setTempComparablePhotos(newTempPhotos);
      } else {
        const newPhotos = [...comparablePhotos];
        URL.revokeObjectURL(newPhotos[index].preview);
        newPhotos.splice(index, 1);
        onComparablePhotosChange(newPhotos);
      }
    } else if (section === 'forSale') {
      if (isTemp) {
        const newTempPhotos = [...tempForSalePhotos];
        URL.revokeObjectURL(newTempPhotos[index].preview);
        newTempPhotos.splice(index, 1);
        setTempForSalePhotos(newTempPhotos);
      } else {
        const newPhotos = [...forSalePhotos];
        URL.revokeObjectURL(newPhotos[index].preview);
        newPhotos.splice(index, 1);
        onForSalePhotosChange(newPhotos);
      }
    } else if (section === 'plan') {
      if (isTemp) {
        const newTempPhotos = [...tempPlanPhotos];
        URL.revokeObjectURL(newTempPhotos[index].preview);
        newTempPhotos.splice(index, 1);
        setTempPlanPhotos(newTempPhotos);
      } else {
        const newPhotos = [...planPhotos];
        URL.revokeObjectURL(newPhotos[index].preview);
        newPhotos.splice(index, 1);
        onPlanPhotosChange(newPhotos);
      }
    }
  };

  // For drag and drop between categories
  const handleDragStart = (photo: any, sourceCategory: 'property' | 'comparable' | 'forSale' | 'plan', index: number, isTemp: boolean) => {
    setDraggedPhoto({ photo, sourceCategory, index, isTemp });
  };

  const handleDragOver = (e: React.DragEvent, targetCategory: 'property' | 'comparable' | 'forSale' | 'plan') => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-green-50', 'border-[#0b8043]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-green-50', 'border-[#0b8043]');
  };

  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategory: 'property' | 'comparable' | 'forSale' | 'plan') => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-green-50', 'border-[#0b8043]');
    
    if (!draggedPhoto) return;
    
    const { photo, sourceCategory, index, isTemp } = draggedPhoto;
    
    // Skip if dropping in the same category
    if (sourceCategory === targetCategory) return;
    
    // Remove from source
    removePhoto(index, isTemp, sourceCategory);
    
    // Add to target with the appropriate type
    let newPhoto: any;
    
    if (targetCategory === 'property') {
      newPhoto = {
        url: photo.preview || photo.url,
        description: ''
      };
      onPhotosChange([...photos, newPhoto]);
    } else {
      let type: 'sold' | 'forSale' | 'plan' | 'cadastre';
      
      if (targetCategory === 'comparable') type = 'sold';
      else if (targetCategory === 'forSale') type = 'forSale';
      else type = planPhotos.length === 0 ? 'plan' : 'cadastre';
      
      newPhoto = {
        file: photo.file,
        preview: photo.preview || photo.url,
        description: '',
        type
      };
      
      if (targetCategory === 'comparable') {
        onComparablePhotosChange([...comparablePhotos, newPhoto]);
      } else if (targetCategory === 'forSale') {
        onForSalePhotosChange([...forSalePhotos, newPhoto]);
      } else if (targetCategory === 'plan') {
        onPlanPhotosChange([...planPhotos, newPhoto]);
      }
    }
    
    setDraggedPhoto(null);
  };

  // For demo purposes, we'll simulate uploading by using the preview URL
  // In a real app, you would upload the file to a server and get a URL back
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    // Convert temp photos to regular photos
    const newPhotos = [
      ...photos,
      ...tempPhotos.map(temp => ({
        url: temp.preview, // In a real app, this would be the URL from the server
        description: ''
      }))
    ];
    
    onPhotosChange(newPhotos);
    onComparablePhotosChange([...comparablePhotos, ...tempComparablePhotos]);
    onForSalePhotosChange([...forSalePhotos, ...tempForSalePhotos]);
    onPlanPhotosChange([...planPhotos, ...tempPlanPhotos]);
    
    onNext();
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    onPrevious();
  };

  const totalPhotosNeeded = 11; // 1 property + 4 comparable + 4 forSale + 2 plan
  const totalPhotosAdded = photos.length + tempPhotos.length + 
                          comparablePhotos.length + tempComparablePhotos.length + 
                          forSalePhotos.length + tempForSalePhotos.length + 
                          planPhotos.length + tempPlanPhotos.length;
  
  const propertyNeeded = Math.max(0, 1 - (photos.length + tempPhotos.length));
  const comparableNeeded = Math.max(0, 4 - (comparablePhotos.length + tempComparablePhotos.length));
  const forSaleNeeded = Math.max(0, 4 - (forSalePhotos.length + tempForSalePhotos.length));
  const planNeeded = Math.max(0, 2 - (planPhotos.length + tempPlanPhotos.length));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Photos
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Ajoutez toutes les photos nécessaires pour l'estimation. Vous pouvez glisser-déposer les photos entre les catégories.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className={`px-3 py-1.5 text-sm font-medium rounded-lg ${propertyNeeded > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          <Camera className="h-4 w-4 inline mr-1" />
          Photo du bien: {photos.length + tempPhotos.length}/1
        </div>
        <div className={`px-3 py-1.5 text-sm font-medium rounded-lg ${comparableNeeded > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          <ImageIcon className="h-4 w-4 inline mr-1" />
          Biens vendus: {comparablePhotos.length + tempComparablePhotos.length}/4
        </div>
        <div className={`px-3 py-1.5 text-sm font-medium rounded-lg ${forSaleNeeded > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          <ImageIcon className="h-4 w-4 inline mr-1" />
          Biens similaires: {forSalePhotos.length + tempForSalePhotos.length}/4
        </div>
        <div className={`px-3 py-1.5 text-sm font-medium rounded-lg ${planNeeded > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          <Map className="h-4 w-4 inline mr-1" />
          Plans: {planPhotos.length + tempPlanPhotos.length}/2
        </div>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
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
          disabled={totalPhotosAdded >= totalPhotosNeeded}
          ref={fileInputRef}
        />
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <Upload className={`h-10 w-10 ${totalPhotosAdded >= totalPhotosNeeded ? 'text-gray-400' : 'text-[#0b8043]'}`} />
          </div>
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-[#0b8043] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0b8043] focus-within:ring-offset-2 hover:text-[#097339]"
            >
              <span>Téléchargez des photos</span>
            </label>
            <p className="pl-1">ou glissez-déposez</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
          <p className="text-xs text-gray-500">
            Vous avez besoin de: 
            {propertyNeeded > 0 && <span className="font-medium text-yellow-700"> {propertyNeeded} photo du bien</span>}
            {comparableNeeded > 0 && <span className="font-medium text-yellow-700">, {comparableNeeded} photos de biens vendus</span>}
            {forSaleNeeded > 0 && <span className="font-medium text-yellow-700">, {forSaleNeeded} photos de biens similaires</span>}
            {planNeeded > 0 && <span className="font-medium text-yellow-700">, {planNeeded} plans</span>}
            {totalPhotosAdded >= totalPhotosNeeded && <span className="font-medium text-green-700">Toutes les photos sont ajoutées!</span>}
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {totalPhotosAdded > 0 && (
        <div className="mt-6 space-y-6">
          {/* Property Photos */}
          <div 
            className="border-2 border-dashed rounded-lg p-4"
            onDragOver={(e) => handleDragOver(e, 'property')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleCategoryDrop(e, 'property')}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Camera className="h-4 w-4 mr-1 text-gray-500" />
              Photo du bien
            </h3>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div 
                  key={`property-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'property', index, false)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, false, 'property')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {tempPhotos.map((photo, index) => (
                <div 
                  key={`property-temp-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'property', index, true)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, true, 'property')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparable Photos */}
          <div 
            className="border-2 border-dashed rounded-lg p-4"
            onDragOver={(e) => handleDragOver(e, 'comparable')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleCategoryDrop(e, 'comparable')}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="h-4 w-4 mr-1 text-gray-500" />
              Photos de biens vendus
            </h3>
            <div className="flex flex-wrap gap-2">
              {comparablePhotos.map((photo, index) => (
                <div 
                  key={`comparable-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'comparable', index, false)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, false, 'comparable')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {tempComparablePhotos.map((photo, index) => (
                <div 
                  key={`comparable-temp-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'comparable', index, true)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, true, 'comparable')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Sale Photos */}
          <div 
            className="border-2 border-dashed rounded-lg p-4"
            onDragOver={(e) => handleDragOver(e, 'forSale')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleCategoryDrop(e, 'forSale')}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon className="h-4 w-4 mr-1 text-gray-500" />
              Photos de biens similaires
            </h3>
            <div className="flex flex-wrap gap-2">
              {forSalePhotos.map((photo, index) => (
                <div 
                  key={`forSale-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'forSale', index, false)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, false, 'forSale')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {tempForSalePhotos.map((photo, index) => (
                <div 
                  key={`forSale-temp-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'forSale', index, true)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, true, 'forSale')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Photos */}
          <div 
            className="border-2 border-dashed rounded-lg p-4"
            onDragOver={(e) => handleDragOver(e, 'plan')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleCategoryDrop(e, 'plan')}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Map className="h-4 w-4 mr-1 text-gray-500" />
              Plans
            </h3>
            <div className="flex flex-wrap gap-2">
              {planPhotos.map((photo, index) => (
                <div 
                  key={`plan-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'plan', index, false)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, false, 'plan')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {tempPlanPhotos.map((photo, index) => (
                <div 
                  key={`plan-temp-${index}`} 
                  className="relative"
                  draggable
                  onDragStart={() => handleDragStart(photo, 'plan', index, true)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="group relative w-32 h-32 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, true, 'plan')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && tempPhotos.length === 0 && 
       comparablePhotos.length === 0 && tempComparablePhotos.length === 0 &&
       forSalePhotos.length === 0 && tempForSalePhotos.length === 0 &&
       planPhotos.length === 0 && tempPlanPhotos.length === 0 && (
        <div className="mt-8 text-center py-12 border rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune photo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter des photos
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
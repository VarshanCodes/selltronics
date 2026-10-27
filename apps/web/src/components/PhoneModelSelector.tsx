'use client';

import React, { useState, useMemo } from 'react';
import {
  PhoneBrand,
  PhoneSeries,
  PhoneModel,
  getBrandCatalog,
  DEFAULT_STORAGE_OPTIONS,
  DEFAULT_RAM_OPTIONS,
} from '@/data/phoneCatalog';

export interface PhoneSelectionResult {
  model: string;
  series: string;
  image: string;
  ram: string;
  storage: string;
  variant?: string;
}

interface PhoneModelSelectorProps {
  brand: string;
  onSelect: (result: PhoneSelectionResult) => void;
  onBack: () => void;
  mode?: 'sell' | 'repair';
  initialModel?: string;
  initialRam?: string;
  initialStorage?: string;
  initialVariant?: string;
  initialImage?: string;
}

export default function PhoneModelSelector({
  brand,
  onSelect,
  onBack,
  mode = 'sell',
  initialModel = '',
  initialRam = '',
  initialStorage = '',
  initialVariant = '',
  initialImage = '',
}: PhoneModelSelectorProps) {
  // Views: 'series' -> 'models' -> 'specs'
  const [view, setView] = useState<'series' | 'models' | 'specs'>('series');
  const [selectedSeries, setSelectedSeries] = useState<PhoneSeries | null>(null);
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(
    initialModel ? { name: initialModel, src: initialImage || '' } : null
  );

  // Search queries
  const [seriesSearch, setSeriesSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  // Specs state
  const [ram, setRam] = useState(initialRam || '8 GB');
  const [storage, setStorage] = useState(initialStorage || '128 GB');
  const [variant, setVariant] = useState(initialVariant || '');

  // Manual fallback inputs
  const [manualModelName, setManualModelName] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Fetch catalog for this brand
  const catalog: PhoneBrand | null = useMemo(() => {
    return getBrandCatalog(brand);
  }, [brand]);

  // All models under this brand (for global search inside brand)
  const allBrandModels = useMemo(() => {
    if (!catalog) return [];
    const list: { seriesName: string; model: PhoneModel }[] = [];
    catalog.series.forEach((s) => {
      s.models.forEach((m) => {
        list.push({ seriesName: s.name, model: m });
      });
    });
    return list;
  }, [catalog]);

  // Filtered series list
  const filteredSeries = useMemo(() => {
    if (!catalog) return [];
    if (!seriesSearch.trim()) return catalog.series;
    const query = seriesSearch.toLowerCase().trim();
    return catalog.series.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.models.some((m) => m.name.toLowerCase().includes(query))
    );
  }, [catalog, seriesSearch]);

  // Global search matching individual models
  const matchingSearchModels = useMemo(() => {
    if (!seriesSearch.trim()) return [];
    const query = seriesSearch.toLowerCase().trim();
    return allBrandModels
      .filter((item) => item.model.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [allBrandModels, seriesSearch]);

  // Filtered models in currently selected series
  const filteredModelsInSeries = useMemo(() => {
    if (!selectedSeries) return [];
    if (!modelSearch.trim()) return selectedSeries.models;
    const query = modelSearch.toLowerCase().trim();
    return selectedSeries.models.filter((m) =>
      m.name.toLowerCase().includes(query)
    );
  }, [selectedSeries, modelSearch]);

  const handleImageError = (modelName: string) => {
    setImageErrors((prev) => ({ ...prev, [modelName]: true }));
  };

  const handleSelectSeries = (series: PhoneSeries) => {
    setSelectedSeries(series);
    setModelSearch('');
    setView('models');
  };

  const handleSelectModel = (model: PhoneModel, seriesName?: string) => {
    setSelectedModel(model);
    if (seriesName && !selectedSeries && catalog) {
      const found = catalog.series.find((s) => s.name === seriesName);
      if (found) setSelectedSeries(found);
    }
    setView('specs');
  };

  const handleManualProceed = (name: string) => {
    if (!name.trim()) return;
    setSelectedModel({
      name: name.trim(),
      src: '',
    });
    setView('specs');
  };

  const handleFinalSubmit = () => {
    if (!selectedModel) return;
    onSelect({
      model: selectedModel.name,
      series: selectedSeries?.name || '',
      image: selectedModel.src || '',
      ram: ram || 'Not sure',
      storage: storage || 'Not sure',
      variant: variant.trim(),
    });
  };

  const totalModelsCount = useMemo(() => {
    if (!catalog) return 0;
    return catalog.series.reduce((acc, s) => acc + s.models.length, 0);
  }, [catalog]);

  // =========================================================================
  // VIEW 1: SELECT SERIES PAGE UI
  // =========================================================================
  if (view === 'series') {
    return (
      <div className="w-full animate-fade-in" style={{ animationDuration: '0.2s' }}>
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#F0EAFB]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] bg-[#FAF7FF] hover:bg-[#F3ECFF] border border-[#E3D9F9] rounded-full transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Brands
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] bg-[#F3ECFF] px-3 py-1 rounded-full border border-[#E3D9F9]">
              {brand} Smartphone Lineup
            </span>
            {totalModelsCount > 0 && (
              <span className="text-xs font-bold text-[#6E6683] bg-white px-2.5 py-1 rounded-full border border-[#E3D9F9]">
                {catalog?.series.length} Series · {totalModelsCount} Models
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <span className="text-xs font-extrabold text-[#7C3AED] tracking-widest uppercase">
            Step 1 · Choose Series
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B29] mt-1 tracking-tight">
            Select Your {brand} Series
          </h2>
          <p className="text-sm text-[#6E6683] mt-1.5 max-w-2xl">
            Choose the phone family or series below to see complete models with photos, or search by name directly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C3AED]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            value={seriesSearch}
            onChange={(e) => setSeriesSearch(e.target.value)}
            placeholder={`Search ${brand} series or exact model name (e.g. Pro, Ultra, Note, Lite)...`}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#E3D9F9] focus:border-[#7C3AED] rounded-2xl text-[15px] text-[#1E1B29] placeholder-[#9CA3AF] outline-none shadow-xs transition-all"
          />
          {seriesSearch && (
            <button
              type="button"
              onClick={() => setSeriesSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-[#6E6683] hover:text-[#1E1B29] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Direct Model Search Matches if Searching */}
        {seriesSearch.trim() && matchingSearchModels.length > 0 && (
          <div className="mb-8 p-4 bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#5B21B6] uppercase tracking-wider">
                Matching Models ({matchingSearchModels.length})
              </span>
              <span className="text-xs text-[#6E6683]">Click to choose directly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {matchingSearchModels.map(({ seriesName, model }) => (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => handleSelectModel(model, seriesName)}
                  className="flex items-center gap-2.5 p-2.5 bg-white hover:bg-[#F3ECFF] border border-[#E3D9F9] hover:border-[#7C3AED] rounded-xl text-left transition-all group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="w-10 h-10 shrink-0 bg-[#FAF7FF] rounded-lg p-1 border border-[#E9EBED] flex items-center justify-center overflow-hidden">
                    {model.src && !imageErrors[model.name] ? (
                      <img
                        src={model.src}
                        alt={model.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => handleImageError(model.name)}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-xs">📱</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#1E1B29] group-hover:text-[#5B21B6] truncate">
                      {model.name}
                    </p>
                    <span className="text-[10px] text-[#6E6683] block truncate">
                      {seriesName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Series Cards Grid */}
        {filteredSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSeries.map((series) => {
              const latestModel = series.models.find((m) => m.src) || series.models[0];
              const sampleModels = series.models.slice(0, 3).map((m) => m.name);
              return (
                <div
                  key={series.name}
                  onClick={() => handleSelectSeries(series)}
                  className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white hover:bg-[#FAF7FF] border-2 border-[#E3D9F9] hover:border-[#7C3AED] rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Latest Phone Image Thumbnail attached right next to the series name */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 bg-[#FAF7FF] group-hover:bg-white rounded-xl p-1.5 border border-[#E3D9F9] flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-all">
                      {latestModel?.src && !imageErrors[latestModel.name] ? (
                        <img
                          src={latestModel.src}
                          alt={latestModel.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={() => handleImageError(latestModel.name)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">📱</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-base sm:text-lg font-extrabold text-[#1E1B29] group-hover:text-[#5B21B6] transition-colors leading-snug">
                          {series.name}
                        </h3>
                        <span className="shrink-0 text-[11px] font-bold text-[#7C3AED] bg-[#F3ECFF] px-2 py-0.5 rounded-full border border-[#E3D9F9]">
                          {series.models.length}
                        </span>
                      </div>

                      {latestModel && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] sm:text-[11px] font-bold text-[#5B21B6] bg-[#F3ECFF] px-2 py-0.5 rounded-md border border-[#E3D9F9] truncate max-w-full">
                            Latest: {latestModel.name}
                          </span>
                        </div>
                      )}

                      <span className="mt-1 text-xs font-semibold text-[#6E6683] block">
                        {series.models.length} models available
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6683] mb-3 line-clamp-1 border-t border-[#F0EAFB] pt-2">
                    Popular: {sampleModels.join(' · ')}
                    {series.models.length > 3 ? '...' : ''}
                  </p>

                  <div className="pt-2 border-t border-[#F0EAFB] flex items-center justify-between text-xs font-extrabold text-[#5B21B6] group-hover:text-[#7C3AED]">
                    <span>Browse All {series.models.length} Phones</span>
                    <span className="w-6 h-6 rounded-full bg-[#F3ECFF] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center transition-colors">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl">
            <p className="text-sm font-semibold text-[#6E6683] mb-3">
              No series matching "{seriesSearch}" found for {brand}.
            </p>
            <button
              type="button"
              onClick={() => setSeriesSearch('')}
              className="text-xs font-bold text-[#5B21B6] underline cursor-pointer"
            >
              Reset search filter
            </button>
          </div>
        )}

        {/* Fallback Manual Model Input */}
        <div className="mt-8 pt-6 border-t border-[#F0EAFB]">
          <div className="bg-[#FAF7FF] p-4 sm:p-5 rounded-2xl border border-[#E3D9F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#1E1B29]">
                Don't see your specific series or model?
              </h4>
              <p className="text-xs text-[#6E6683] mt-0.5">
                Type your {brand} model name manually and continue directly.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={manualModelName}
                onChange={(e) => setManualModelName(e.target.value)}
                placeholder={`e.g. ${brand} Custom Model`}
                className="px-3.5 py-2 text-sm bg-white border border-[#D8C8F6] rounded-xl text-[#1E1B29] outline-none focus:border-[#7C3AED]"
              />
              <button
                type="button"
                onClick={() => handleManualProceed(manualModelName)}
                disabled={!manualModelName.trim()}
                className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SELECT PHONE MODEL WITH IMAGE PAGE UI
  // =========================================================================
  if (view === 'models' && selectedSeries) {
    return (
      <div className="w-full animate-fade-in" style={{ animationDuration: '0.2s' }}>
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#F0EAFB]">
          <button
            type="button"
            onClick={() => setView('series')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] bg-[#FAF7FF] hover:bg-[#F3ECFF] border border-[#E3D9F9] rounded-full transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Series
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6E6683]">
            <span className="text-[#5B21B6]">{brand}</span>
            <span>›</span>
            <span className="text-[#1E1B29] font-extrabold">{selectedSeries.name}</span>
            <span className="ml-1 text-xs text-[#7C3AED] bg-[#F3ECFF] px-2 py-0.5 rounded-md border border-[#E3D9F9]">
              {selectedSeries.models.length} models
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <span className="text-xs font-extrabold text-[#7C3AED] tracking-widest uppercase">
            Step 2 · Choose Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B29] mt-1 tracking-tight">
            {selectedSeries.name}
          </h2>
          <p className="text-sm text-[#6E6683] mt-1.5">
            Select your exact phone model below. Click any card to enter RAM and memory specifications.
          </p>
        </div>

        {/* Filter within this series */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C3AED]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder={`Filter ${selectedSeries.name} models...`}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#E3D9F9] focus:border-[#7C3AED] rounded-2xl text-[15px] text-[#1E1B29] placeholder-[#9CA3AF] outline-none shadow-xs transition-all"
          />
          {modelSearch && (
            <button
              type="button"
              onClick={() => setModelSearch('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-[#6E6683] hover:text-[#1E1B29] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Models Grid with Images & Names */}
        {filteredModelsInSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredModelsInSeries.map((model) => {
              const hasError = imageErrors[model.name];
              return (
                <div
                  key={model.name}
                  onClick={() => handleSelectModel(model)}
                  className="group relative flex flex-col p-3 bg-white hover:bg-[#FAF7FF] border-2 border-[#E3D9F9] hover:border-[#7C3AED] rounded-2xl transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md text-center"
                >
                  {/* Photo Container */}
                  <div className="relative w-full aspect-square bg-[#FAF7FF] rounded-xl p-2.5 mb-2.5 flex items-center justify-center overflow-hidden border border-[#E9EBED] group-hover:border-[#E3D9F9]">
                    {model.src && !hasError ? (
                      <img
                        src={model.src}
                        alt={model.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => handleImageError(model.name)}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      /* Clean phone silhouette fallback */
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <div className="w-12 h-20 border-2 border-[#9CA3AF] rounded-xl bg-gradient-to-b from-gray-50 to-gray-200 shadow-inner flex flex-col items-center justify-between py-1.5 px-1">
                          <div className="w-4 h-1 bg-[#9CA3AF] rounded-full"></div>
                          <span className="text-[9px] font-bold text-[#4B5563] truncate w-full text-center">
                            {brand}
                          </span>
                          <div className="w-2.5 h-2.5 border border-[#9CA3AF] rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Model Name */}
                  <div className="flex-1 flex flex-col justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#1E1B29] group-hover:text-[#5B21B6] transition-colors leading-tight line-clamp-2">
                      {model.name}
                    </h4>
                    <span className="mt-2 inline-block text-[11px] font-bold text-[#7C3AED] group-hover:underline">
                      Select Model →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-[#FAF7FF] border border-[#E3D9F9] rounded-2xl">
            <p className="text-sm font-semibold text-[#6E6683] mb-3">
              No phone matching "{modelSearch}" in {selectedSeries.name}.
            </p>
            <button
              type="button"
              onClick={() => setModelSearch('')}
              className="text-xs font-bold text-[#5B21B6] underline cursor-pointer"
            >
              Show all models in this series
            </button>
          </div>
        )}

        {/* Fallback Manual Input */}
        <div className="mt-8 pt-6 border-t border-[#F0EAFB]">
          <div className="bg-[#FAF7FF] p-4 sm:p-5 rounded-2xl border border-[#E3D9F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#1E1B29]">
                Model not listed in this series?
              </h4>
              <p className="text-xs text-[#6E6683] mt-0.5">
                Type your exact model name manually and continue to RAM/storage selection.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={manualModelName}
                onChange={(e) => setManualModelName(e.target.value)}
                placeholder="e.g. iPhone 13 Pro Max"
                className="px-3.5 py-2 text-sm bg-white border border-[#D8C8F6] rounded-xl text-[#1E1B29] outline-none focus:border-[#7C3AED]"
              />
              <button
                type="button"
                onClick={() => handleManualProceed(manualModelName)}
                disabled={!manualModelName.trim()}
                className="px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: RAM & MEMORY / STORAGE SPECIFICATIONS PAGE UI
  // =========================================================================
  return (
    <div className="w-full animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#F0EAFB]">
        <button
          type="button"
          onClick={() => {
            if (selectedSeries) {
              setView('models');
            } else {
              setView('series');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B21B6] hover:text-[#7C3AED] bg-[#FAF7FF] hover:bg-[#F3ECFF] border border-[#E3D9F9] rounded-full transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Change Model
        </button>

        <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] bg-[#F3ECFF] px-3 py-1 rounded-full border border-[#E3D9F9]">
          Step 3 · Specifications
        </span>
      </div>

      {/* Selected Phone Hero Card */}
      {selectedModel && (
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-[#FAF7FF] to-[#F3ECFF] border-2 border-[#E3D9F9] rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-2 border border-[#E3D9F9] flex items-center justify-center shrink-0 shadow-xs">
            {selectedModel.src && !imageErrors[selectedModel.name] ? (
              <img
                src={selectedModel.src}
                alt={selectedModel.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => handleImageError(selectedModel.name)}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-3xl">📱</span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-extrabold text-[#7C3AED] uppercase bg-white px-2.5 py-0.5 rounded-md border border-[#E3D9F9]">
                {brand}
              </span>
              {selectedSeries && (
                <span className="text-xs font-bold text-[#6E6683] bg-white px-2 py-0.5 rounded-md border border-[#E3D9F9]">
                  {selectedSeries.name}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E1B29] leading-tight">
              {selectedModel.name}
            </h3>
            <p className="text-xs text-[#6E6683] mt-1">
              {mode === 'sell'
                ? 'Select RAM and storage configuration to calculate your accurate valuation quote.'
                : 'Select device memory specifications for this repair booking.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (selectedSeries) setView('models');
              else setView('series');
            }}
            className="text-xs font-bold text-[#5B21B6] hover:text-[#7C3AED] bg-white px-3 py-1.5 rounded-full border border-[#D8C8F6] shadow-2xs hover:bg-[#F3ECFF] transition-all cursor-pointer"
          >
            Change
          </button>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B29]">
          Enter Device Specifications
        </h2>
        <p className="text-sm text-[#6E6683] mt-1">
          Choose the storage capacity (ROM) and RAM for an exact match.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Storage / Internal Memory (ROM) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3D9F9]">
          <label className="block text-sm font-extrabold text-[#1E1B29] mb-3">
            1. Internal Storage / Memory (ROM) <span className="text-[#7C3AED]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {DEFAULT_STORAGE_OPTIONS.map((opt) => {
              const isSelected = storage === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStorage(opt)}
                  className={`py-3 px-2 text-center rounded-xl font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${isSelected
                      ? 'border-[#7C3AED] bg-[#5B21B6] text-white shadow-sm'
                      : 'border-[#E3D9F9] bg-white text-[#1E1B29] hover:bg-[#FAF7FF] hover:border-[#7C3AED]'
                    }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. RAM (Memory) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3D9F9]">
          <label className="block text-sm font-extrabold text-[#1E1B29] mb-3">
            2. RAM (System Memory) <span className="text-[#7C3AED]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            {DEFAULT_RAM_OPTIONS.map((opt) => {
              const isSelected = ram === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRam(opt)}
                  className={`py-3 px-2 text-center rounded-xl font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer ${isSelected
                      ? 'border-[#7C3AED] bg-[#5B21B6] text-white shadow-sm'
                      : 'border-[#E3D9F9] bg-white text-[#1E1B29] hover:bg-[#FAF7FF] hover:border-[#7C3AED]'
                    }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Variant / Color / Extra details */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3D9F9]">
          <label className="block text-sm font-extrabold text-[#1E1B29] mb-2">
            3. Color / Variant / Extra details <span className="text-xs font-normal text-[#6E6683]">(optional)</span>
          </label>
          <input
            type="text"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="e.g. Natural Titanium, Deep Blue, 5G, Indian version..."
            className="w-full px-4 py-3 bg-white border border-[#E3D9F9] focus:border-[#7C3AED] rounded-xl text-sm text-[#1E1B29] outline-none transition-all"
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#F0EAFB]">
        <button
          type="button"
          onClick={() => {
            if (selectedSeries) setView('models');
            else setView('series');
          }}
          className="px-5 py-2.5 border border-[#D8C8F6] text-[#5B21B6] rounded-full font-bold hover:bg-[#F3ECFF] transition-all cursor-pointer text-sm"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={!selectedModel || !ram || !storage}
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-full font-extrabold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}


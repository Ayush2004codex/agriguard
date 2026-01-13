import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Camera, 
  Leaf, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Beaker,
  Flower2
} from 'lucide-react';
import apiService from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface AnalysisResult {
  disease_detected?: boolean;
  disease_name?: string;
  confidence?: number;
  urgency_level?: string;
  description?: string;
  symptoms?: string[];
  treatment_organic?: Record<string, string>;
  treatment_chemical?: Record<string, any>;
  prevention_tips?: string[];
  raw_analysis?: string;
}

const PlantScanner: React.FC = () => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [showRawAnalysis, setShowRawAnalysis] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await apiService.analyzeLeaf(selectedFile, cropType || undefined);
      setResult(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Make sure the backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Leaf className="w-7 h-7 text-primary-600" />
            {t('plantScanner')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('scannerDesc')}
          </p>
        </div>

        {/* Crop type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('cropType')} ({t('optional')})
          </label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            title={t('selectCrop')}
          >
            <option value="">Auto-detect</option>
            <option value="tomato">Tomato</option>
            <option value="potato">Potato</option>
            <option value="corn">Corn/Maize</option>
            <option value="rice">Rice</option>
            <option value="wheat">Wheat</option>
            <option value="cotton">Cotton</option>
            <option value="pepper">Pepper/Chili</option>
            <option value="cucumber">Cucumber</option>
            <option value="grapes">Grapes</option>
            <option value="apple">Apple</option>
          </select>
        </div>

        {/* Upload area */}
        {!preview && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary-100 rounded-full">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? t('dragDrop') : t('dragDrop')}
                </p>
                <p className="text-gray-500 mt-1">{t('supportedFormats')}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Camera className="w-4 h-4" /> {t('takePhoto')}
                </span>
                <span className="flex items-center gap-1">
                  <Leaf className="w-4 h-4" /> {t('uploadImage')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-100"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                    <p className="mt-2">{t('analyzing')}</p>
                  </div>
                </div>
              )}
            </div>

            {!result && (
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('resetScan')}
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('analyzing')}
                    </>
                  ) : (
                    <>
                      <Leaf className="w-5 h-5" />
                      {t('analyzeImage')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">{t('error')}</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Main result */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {result.disease_name || t('diseaseDetected')}
                  </h2>
                  {result.confidence && (
                    <p className="text-gray-600 text-sm mt-1">
                      {t('confidence')}: {Math.round(result.confidence * 100)}%
                    </p>
                  )}
                </div>
                {result.urgency_level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(result.urgency_level)}`}>
                    {result.urgency_level.toUpperCase()}
                  </span>
                )}
              </div>

              {result.description && (
                <p className="text-gray-700 mb-4">{result.description}</p>
              )}

              {/* Symptoms */}
              {result.symptoms && result.symptoms.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{t('symptoms')}:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {result.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Treatments */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Organic */}
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                  <Flower2 className="w-5 h-5" />
                  {t('organicTreatment')}
                </h3>
                {result.treatment_organic && Object.keys(result.treatment_organic).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(result.treatment_organic).map(([product, desc], idx) => (
                      <li key={idx} className="text-green-700">
                        <span className="font-medium">{product}:</span>{' '}
                        <span className="text-green-600">{desc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 text-sm">
                    Analysis will provide organic treatment options.
                  </p>
                )}
              </div>

              {/* Chemical */}
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                  <Beaker className="w-5 h-5" />
                  {t('chemicalTreatment')}
                </h3>
                {result.treatment_chemical && Object.keys(result.treatment_chemical).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(result.treatment_chemical).map(([product, info], idx) => (
                      <li key={idx} className="text-blue-700">
                        <span className="font-medium">{product}:</span>{' '}
                        <span className="text-blue-600">
                          {typeof info === 'object' ? `${info.dosage} - ${info.safety}` : info}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-600 text-sm">
                    Analysis will provide chemical treatment options if needed.
                  </p>
                )}
              </div>
            </div>

            {/* Prevention */}
            {result.prevention_tips && result.prevention_tips.length > 0 && (
              <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  {t('prevention')}
                </h3>
                <ul className="space-y-1">
                  {result.prevention_tips.map((tip, idx) => (
                    <li key={idx} className="text-purple-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw analysis toggle */}
            {result.raw_analysis && (
              <div className="bg-gray-50 rounded-xl border border-gray-200">
                <button
                  onClick={() => setShowRawAnalysis(!showRawAnalysis)}
                  className="w-full p-4 flex items-center justify-between text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="font-medium">View Full AI Analysis</span>
                  {showRawAnalysis ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {showRawAnalysis && (
                  <div className="px-4 pb-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-white p-4 rounded-lg border overflow-x-auto">
                      {result.raw_analysis}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Scan another */}
            <button
              onClick={reset}
              className="w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('resetScan')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantScanner;

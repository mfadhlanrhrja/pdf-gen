import { useState, useRef } from 'react';
import { Download, X, Plus, FileText, Settings, Moon, Sun, Trash2, Camera } from 'lucide-react';
import { PDFGenerator } from '../utils/pdfGenerator';

const ProjectDocumentGenerator = () => {
  const [projects, setProjects] = useState([{ id: 1, photos: {} }]);
  const [headerText, setHeaderText] = useState('PEKERJAAN');
  const [subTitleText, setSubTitleText] = useState('Pekerjaan Pemasangan aluminium');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [nextProjectId, setNextProjectId] = useState(2);

  const progressLevels = ['0%', '50%', '100%'];

  const addProject = () => {
    setProjects([...projects, { id: nextProjectId, photos: {} }]);
    setNextProjectId(nextProjectId + 1);
  };

  const removeProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleFileUpload = (projectId, progress, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            photos: {
              ...project.photos,
              [progress]: {
                file: file,
                data: e.target.result,
                name: file.name,
                size: file.size
              }
            }
          };
        }
        return project;
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (projectId, progress) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const newPhotos = { ...project.photos };
        delete newPhotos[progress];
        return { ...project, photos: newPhotos };
      }
      return project;
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateDocument = async () => {
    if (projects.length === 0) {
      alert('Tambahkan minimal satu proyek terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    
    try {
      const pdf = await PDFGenerator.generateDocument(
        headerText, 
        subTitleText,
        projects
      );
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `${headerText}_${timestamp}.pdf`;
      
      PDFGenerator.downloadPDF(pdf, filename);
      alert('Dokumen PDF berhasil dibuat dan didownload!');
      
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Terjadi kesalahan saat membuat dokumen. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadArea = ({ projectId, progress }) => {
    const fileInputRef = useRef(null);
    const project = projects.find(p => p.id === projectId);
    const photo = project?.photos[progress];

    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
            <span className="text-2xl font-bold text-white">{progress}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-200">Progress {progress}</h4>
        </div>
        
        <div 
          className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-blue-400 transition-all duration-300 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleFileUpload(projectId, progress, e.target.files[0])}
          />
          
          {photo ? (
            <div className="relative">
              <img 
                src={photo.data} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(projectId, progress);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm text-green-400 font-semibold">✓ {photo.name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(photo.size)}</p>
            </div>
          ) : (
            <div>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Klik untuk upload foto</p>
              <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP, BMP, TIFF</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProjectCard = ({ project, projectIndex }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center text-white">
          <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
            {projectIndex + 1}
          </span>
          {headerText} {projectIndex + 1}
        </h3>
        {projects.length > 1 && (
          <button
            onClick={() => removeProject(project.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {progressLevels.map(level => (
          <FileUploadArea 
            key={`${project.id}-${level}`}
            projectId={project.id} 
            progress={level} 
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PDF Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Buat Laporan PDF
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Upload foto progres proyek dan buat dokumen PDF dengan layout yang dioptimalkan
          </p>
        </div>

        {/* Project Form */}
        <div className="max-w-4xl mx-auto">
          {/* Header Configuration */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-400" />
              Pengaturan Teks
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Header (Judul Besar)
                </label>
                <input 
                  type="text" 
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="PEKERJAAN"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sub Judul
                </label>
                <input 
                  type="text" 
                  value={subTitleText}
                  onChange={(e) => setSubTitleText(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Pekerjaan Pemasangan aluminium"
                />
              </div>
            </div>
          </div>

          {/* Projects */}
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              projectIndex={index} 
            />
          ))}

          {/* Add Project Button */}
          <div className="text-center mb-8">
            <button 
              onClick={addProject}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-6 h-6 mr-2" />
              Tambah {headerText}
            </button>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button 
              onClick={generateDocument}
              disabled={isLoading}
              className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full font-bold text-white text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              ) : (
                <Download className="w-6 h-6 mr-3" />
              )}
              {isLoading ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        </div>
      </main>

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-sm w-full mx-4 border border-white/20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2 text-white">Membuat PDF...</h3>
              <p className="text-gray-300">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocumentGenerator;

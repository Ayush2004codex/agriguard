import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Camera,
  Shield,
  Cloud,
  Bot,
  Menu,
  X,
  AlertCircle,
  Globe,
  Bell,
  Settings,
  Leaf,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Check,
  Bug,
  Droplets,
  Thermometer,
  AlertTriangle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import PlantScanner from './components/PlantScanner';
import IPMPlanner from './components/IPMPlanner';
import WeatherDashboard from './components/WeatherDashboard';
import AIAgent from './components/AIAgent';
import apiService from './services/api';
import { LanguageProvider, useLanguage, LANGUAGES } from './context/LanguageContext';

type Tab = 'dashboard' | 'scanner' | 'ipm' | 'weather' | 'agent';

interface AIStatus {
  primary_provider: string;
  ollama: { status: string; models: string[] };
  groq: { status: string };
  gemini: { status: string };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const { language, setLanguage, getCurrentLanguage } = useLanguage();

  // Sample notifications - in a real app, these would come from the backend
  const notifications = [
    { id: 1, type: 'warning', icon: Bug, title: 'Pest Alert', message: 'Aphid activity detected in Field A - North Section', time: '10 min ago', unread: true },
    { id: 2, type: 'info', icon: Droplets, title: 'Irrigation Reminder', message: 'Scheduled irrigation for Field B in 2 hours', time: '1 hour ago', unread: true },
    { id: 3, type: 'success', icon: Check, title: 'Analysis Complete', message: 'Leaf scan results ready - No disease detected', time: '2 hours ago', unread: false },
    { id: 4, type: 'warning', icon: Thermometer, title: 'Weather Alert', message: 'Frost warning tonight - Consider crop protection', time: '3 hours ago', unread: false },
    { id: 5, type: 'info', icon: AlertTriangle, title: 'Soil Health', message: 'Nitrogen levels below optimal in Field C', time: '5 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    // Check backend connection
    apiService.getAIStatus()
      .then(status => {
        setAiStatus(status);
        setConnectionError(false);
      })
      .catch(() => {
        setConnectionError(true);
      });
  }, []);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner' as Tab, label: 'Scanner', icon: Camera },
    { id: 'ipm' as Tab, label: 'IPM Strategy', icon: Shield },
    { id: 'weather' as Tab, label: 'Weather', icon: Cloud },
    { id: 'agent' as Tab, label: 'AI Agent', icon: Bot },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <PlantScanner />;
      case 'ipm':
        return <IPMPlanner />;
      case 'weather':
        return <WeatherDashboard />;
      case 'agent':
        return <AIAgent />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Backend not connected. Make sure to run the FastAPI server.
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between relative z-50">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900 text-lg">AgriGuard</h1>
            <p className="text-xs text-gray-500">AI-Powered Precision Farming & Pest Management</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* AI Status Indicator */}
          {aiStatus && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                aiStatus.groq.status === 'ready' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-600">AI Connected</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              title="Change language"
            >
              <span className="text-lg">{getCurrentLanguage().flag}</span>
              <Globe className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {showLanguageMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLanguageMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 ${
                        language === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowLanguageMenu(false); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" 
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${notif.unread ? 'bg-primary-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                            notif.type === 'success' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <notif.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                              {notif.unread && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-center text-sm text-primary-600 font-medium hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowLanguageMenu(false); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Settings</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Voice Settings */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {voiceEnabled ? <Volume2 className="w-5 h-5 text-primary-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Voice Input</p>
                          <p className="text-xs text-gray-500">Enable microphone</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}
                        title="Toggle voice input"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${voiceEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Auto Speak Responses */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className={`w-5 h-5 ${autoSpeak ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Auto-Speak</p>
                          <p className="text-xs text-gray-500">Read AI responses aloud</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${autoSpeak ? 'bg-primary-500' : 'bg-gray-300'}`}
                        title="Toggle auto-speak"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSpeak ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5 text-primary-600" /> : <Sun className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                          <p className="text-xs text-gray-500">Coming soon</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}
                        disabled
                        title="Toggle dark mode (coming soon)"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">AI Provider Status</p>
                      {aiStatus && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Groq</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiStatus.groq.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {aiStatus.groq.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Gemini</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiStatus.gemini.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {aiStatus.gemini.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Ollama</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiStatus.ollama.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {aiStatus.ollama.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg hidden sm:flex items-center justify-center text-white font-medium text-sm">
            AF
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden bg-white border-t border-gray-200 px-2 py-2 flex justify-around">
        {tabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-400'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Wrap App with LanguageProvider
const AppWithLanguage: React.FC = () => (
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

export default AppWithLanguage;

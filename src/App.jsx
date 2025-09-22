import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Globe, Zap, Shield, Code, Play, Copy, Star, Github, AlertCircle, Menu, ExternalLink, Download, BookOpen, Users, ChevronDown, Search } from 'lucide-react';
import logo from './assets/FormaFlex.png'
import logo_fav from './assets/favicon.png'
// Mock FormFlex implementation for demo purposes
const createFormStore = () => {
  let forms = {};
  let subscribers = new Set();

  const notify = () => subscribers.forEach(fn => fn());

  return {
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    getState: () => forms,
    initializeForm: (formId, initial, rules, options = {}) => {
      forms[formId] = {
        values: initial,
        errors: {},
        rules,
        options
      };
      notify();
    },
    setField: (formId, key, value) => {
      if (forms[formId]) {
        forms[formId].values = { ...forms[formId].values, [key]: value };

        const rules = forms[formId].rules[key] || [];
        let error = undefined;

        for (const rule of rules) {
          if (rule.type === 'required' && (!value || value.trim() === '')) {
            error = rule.message || 'Required';
            break;
          }
          if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = rule.message || 'Invalid email';
            break;
          }
          if (rule.type === 'minLength' && value && value.length < rule.length) {
            error = rule.message || `Min length ${rule.length}`;
            break;
          }
        }

        forms[formId].errors = { ...forms[formId].errors, [key]: error };
        notify();
      }
    },
    getValues: (formId) => forms[formId]?.values,
    getErrors: (formId) => forms[formId]?.errors,
    isValid: (formId) => {
      const errors = forms[formId]?.errors || {};
      return Object.values(errors).every(err => !err);
    }
  };
};

const formStore = createFormStore();

const useForm = (formId) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = formStore.subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  return {
    values: formStore.getValues(formId) || {},
    errors: formStore.getErrors(formId) || {},
    setField: (key, value) => formStore.setField(formId, key, value),
    isValid: formStore.isValid(formId)
  };
};

const useFormValidator = (initial, rules, options = {}) => {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const validateField = (key, value) => {
    const fieldRules = rules[key];
    if (!fieldRules) return;

    for (const rule of fieldRules) {
      if (rule.type === 'required' && (!value || value.trim() === '')) {
        setErrors(prev => ({ ...prev, [key]: rule.message || 'Required' }));
        return;
      }
      if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors(prev => ({ ...prev, [key]: rule.message || 'Invalid email' }));
        return;
      }
      if (rule.type === 'minLength' && value && value.length < rule.length) {
        setErrors(prev => ({ ...prev, [key]: rule.message || `Min length ${rule.length}` }));
        return;
      }
    }
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const setField = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (options.validateOnChange) {
      setTimeout(() => validateField(key, value), options.debounce || 0);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in rules) {
      const value = values[key];
      const fieldRules = rules[key];
      
      for (const rule of fieldRules) {
        if (rule.type === 'required' && (!value || value.trim() === '')) {
          newErrors[key] = rule.message || 'Required';
          break;
        }
        if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[key] = rule.message || 'Invalid email';
          break;
        }
        if (rule.type === 'minLength' && value && value.length < rule.length) {
          newErrors[key] = rule.message || `Min length ${rule.length}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 ? { success: true, data: values } : { success: false, errors: newErrors };
  };

  const isValid = Object.values(errors).every(e => !e);

  return {
    values,
    errors,
    setField,
    validateForm,
    isValid
  };
};

const FormFlexDocs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeExample, setActiveExample] = useState('basic');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Demo form setup
  useEffect(() => {
    formStore.initializeForm('demo',
      { email: '', password: '', confirmPassword: '' },
      {
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Please enter a valid email' }
        ],
        password: [
          { type: 'required', message: 'Password is required' },
          { type: 'minLength', length: 6, message: 'Password must be at least 6 characters' }
        ],
        confirmPassword: [
          { type: 'required', message: 'Please confirm your password' }
        ]
      },
      { validateOnChange: true }
    );
  }, []);

  const demoForm = useForm('demo');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const features = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Lightning Fast",
      description: "Optimistic updates with automatic rollback on validation failures",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: "Global State",
      description: "Share form state across components without prop drilling",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Type Safety",
      description: "Built-in TypeScript support with comprehensive validation",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: <Code className="w-7 h-7" />,
      title: "Zero Config",
      description: "Minimal bundle size with sensible defaults and customization",
      gradient: "from-purple-400 to-pink-500"
    }
  ];

  const stats = [
    { label: "Bundle Size", value: "12kb", subtitle: "gzipped" },
    { label: "Performance", value: "99%", subtitle: "lighthouse" },
    { label: "TypeScript", value: "100%", subtitle: "coverage" },
    { label: "Stars", value: "2.5k", subtitle: "github" }
  ];

  const codeExamples = {
    basic: `// Basic Usage - Simple & Intuitive
import { useFormValidator } from 'formaflex';

const LoginForm = () => {
  const form = useFormValidator(
    { email: '', password: '' },
    {
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', length: 8, message: 'Min 8 characters' }
      ]
    },
    { validateOnChange: true, debounce: 300 }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = form.validateForm();
    if (result.success) {
      // Handle successful submission
      console.log('Form data:', result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={form.values.email}
        onChange={(e) => form.setField('email', e.target.value)}
        placeholder="Email"
        className="input"
      />
      {form.errors.email && (
        <span className="error">{form.errors.email}</span>
      )}
      
      <input
        type="password"
        value={form.values.password}
        onChange={(e) => form.setField('password', e.target.value)}
        placeholder="Password"
        className="input"
      />
      {form.errors.password && (
        <span className="error">{form.errors.password}</span>
      )}
      
      <button 
        type="submit" 
        disabled={!form.isValid}
        className="btn-primary"
      >
        Sign In
      </button>
    </form>
  );
};`,
    global: `// Global Form Management - Share Across Components
import { useGlobalFormsStore, useGlobalFormValidator } from 'formaflex';

// Initialize globally (in app root or custom hook)
const initializeUserForm = () => {
  useGlobalFormsStore.getState().initializeForm(
    'userProfile',
    { 
      personalInfo: { name: '', email: '' },
      preferences: { newsletter: false, theme: 'light' }
    },
    {
      'personalInfo.name': [
        { type: 'required', message: 'Name is required' }
      ],
      'personalInfo.email': [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email' }
      ]
    },
    { validateOnChange: true }
  );
};

// Use in any component
const ProfileForm = () => {
  const form = useGlobalFormValidator('userProfile');
  
  return (
    <div className="form-container">
      <FormField name="personalInfo.name" form={form}>
        {({ value, onChange, error }) => (
          <InputGroup label="Full Name" error={error}>
            <input 
              value={value} 
              onChange={(e) => onChange(e.target.value)}
              className="input"
            />
          </InputGroup>
        )}
      </FormField>
      
      <FormField name="personalInfo.email" form={form}>
        {({ value, onChange, error }) => (
          <InputGroup label="Email Address" error={error}>
            <input 
              type="email"
              value={value} 
              onChange={(e) => onChange(e.target.value)}
              className="input"
            />
          </InputGroup>
        )}
      </FormField>
    </div>
  );
};`,
    advanced: `// Advanced Features - Custom Validation & Async
const RegistrationForm = () => {
  const form = useFormValidator(
    { 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    },
    {
      username: [
        { type: 'required', message: 'Username is required' },
        { type: 'minLength', length: 3, message: 'Min 3 characters' },
        { 
          type: 'custom', 
          validate: async (value) => {
            // Async validation with API call
            const response = await fetch(\`/api/check-username/\${value}\`);
            return response.ok;
          },
          message: 'Username not available'
        }
      ],
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' },
        {
          type: 'custom',
          validate: async (email) => {
            const response = await fetch('/api/check-email', {
              method: 'POST',
              body: JSON.stringify({ email }),
              headers: { 'Content-Type': 'application/json' }
            });
            return response.status !== 409;
          },
          message: 'Email already registered'
        }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', length: 8, message: 'Min 8 characters' },
        {
          type: 'custom',
          validate: (password) => {
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumbers = /\\d/.test(password);
            const hasSpecialChars = /[!@#$%^&*]/.test(password);
            
            return hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
          },
          message: 'Password must contain uppercase, lowercase, numbers, and special characters'
        }
      ],
      confirmPassword: [
        { type: 'required', message: 'Please confirm password' },
        { 
          type: 'confirm', 
          field: 'password', 
          message: 'Passwords must match' 
        }
      ]
    },
    {
      validateOnChange: true,
      debounce: 500 // Debounce async validations
    }
  );

  return (
    <form className="registration-form">
      {/* Form fields with advanced validation feedback */}
    </form>
  );
};`
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'installation', label: 'Installation', icon: Download },
    { id: 'basic-usage', label: 'Basic Usage', icon: Play },
    { id: 'global-forms', label: 'Global Forms', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'api', label: 'API Reference', icon: Code }
  ];

  const BasicFormDemo = () => {
    const form = useFormValidator(
      { email: '', password: '' },
      {
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Please enter a valid email' }
        ],
        password: [
          { type: 'required', message: 'Password is required' },
          { type: 'minLength', length: 8, message: 'Password must be at least 8 characters' }
        ]
      },
      { validateOnChange: true, debounce: 300 }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      const result = form.validateForm();
      if (result.success) {
        alert('Form submitted successfully!');
      }
    };

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Interactive Demo</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${form.isValid ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {form.isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={form.values.email || ''}
                onChange={(e) => form.setField('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                  form.errors.email 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : form.values.email 
                      ? 'border-green-300 bg-green-50 focus:border-green-500' 
                      : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Enter your email"
              />
              {form.values.email && !form.errors.email && (
                <Check className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {form.errors.email && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{form.errors.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type="password"
                value={form.values.password || ''}
                onChange={(e) => form.setField('password', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                  form.errors.password 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : form.values.password 
                      ? 'border-green-300 bg-green-50 focus:border-green-500' 
                      : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Enter your password"
              />
              {form.values.password && !form.errors.password && (
                <Check className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {form.errors.password && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{form.errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!form.isValid}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
              form.isValid 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {form.isValid ? (
              <span className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Submit Form</span>
              </span>
            ) : (
              'Complete Form to Submit'
            )}
          </button>
        </form>
        
        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
            <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
            <span>View Form State</span>
          </summary>
          <div className="mt-3 p-4 bg-gray-900 rounded-lg overflow-auto">
            <pre className="text-xs text-green-400">
{JSON.stringify({ 
  values: form.values, 
  errors: form.errors,
  isValid: form.isValid 
}, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  };

  const CodeBlock = ({ code, language = 'javascript', id }) => (
    <div className="relative group">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm text-gray-400 ml-4">{language}</span>
          </div>
          <button
            onClick={() => copyToClipboard(code, id)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {copiedCode === id ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="text-sm text-gray-100">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div style={{width: '50px', height: '50px'}}>
                  <img src={logo_fav} style={{width: '100%', height: '100%', ObjectFit: 'contain'}} />
                </div>
                {/* <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
                </div> */}
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FormFlex
                </h1>   
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Examples</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GitHub</a>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                Get Started
              </button>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              <span>2.5k+ developers trust FormFlex</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Form validation
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The most powerful React form validation framework with global state management, 
              optimistic updates, and zero configuration needed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-1">
                Get Started
              </button>
              <button className="flex items-center justify-center space-x-2 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-colors">
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FormFlex?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for modern React applications with performance and developer experience in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r opacity-25 group-hover:opacity-75 transition-opacity duration-200 rounded-2xl blur"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Navigation</h3>
              <nav className="space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {activeTab === 'overview' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-700 leading-relaxed mb-8">
                      FormFlex is a powerful React form validation framework that combines the best of
                      React Hook Form, Formik, and Yup into a single, cohesive solution. It provides
                      both local and global state management with optimistic updates, comprehensive
                      validation rules, and TypeScript support out of the box.
                    </p>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Principles</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Performance First</h4>
                            <p className="text-gray-600">Optimistic updates and minimal re-renders</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Code className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Developer Experience</h4>
                            <p className="text-gray-600">Intuitive API with excellent TypeScript support</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Flexibility</h4>
                            <p className="text-gray-600">Works for simple forms to complex multi-step workflows</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">Zero Configuration</h4>
                            <p className="text-gray-600">Sensible defaults with extensive customization</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <BasicFormDemo />
                  </div>
                </div>
              )}

              {activeTab === 'installation' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <Download className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">Installation</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Package Managers</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">NPM</h4>
                          <CodeBlock code="npm install formaflex" id="npm-install" language="bash" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Yarn</h4>
                          <CodeBlock code="yarn add formaflex" id="yarn-install" language="bash" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-6 h-6 text-green-600 mr-2" />
                        Minimal Dependencies
                      </h3>
                      <p className="text-gray-700 mb-4">
                        FormFlex has carefully chosen minimal dependencies to keep your bundle size small:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Core Dependencies</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li><code className="bg-gray-100 px-2 py-1 rounded">lodash/get</code> - Safe nested access</li>
                            <li><code className="bg-gray-100 px-2 py-1 rounded">lodash/set</code> - Safe nested updates</li>
                            <li><code className="bg-gray-100 px-2 py-1 rounded">lodash/cloneDeep</code> - Deep cloning</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Optional</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li><code className="bg-gray-100 px-2 py-1 rounded">zustand</code> - Global state (optional)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-semibold text-blue-900 mb-2">Pro Tip</h4>
                          <p className="text-blue-800">
                            If you're already using lodash in your project, FormFlex adds virtually zero bundle size!
                            The total gzipped size is only ~12kb when lodash is excluded.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'basic-usage' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <Play className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">Basic Usage</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex border-b border-gray-200 mb-6">
                        {Object.keys(codeExamples).map(key => (
                          <button
                            key={key}
                            onClick={() => setActiveExample(key)}
                            className={`px-6 py-3 font-semibold capitalize transition-all duration-200 ${
                              activeExample === key
                                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {key} Example
                          </button>
                        ))}
                      </div>

                      <CodeBlock code={codeExamples[activeExample]} id={`example-${activeExample}`} />
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Validation Rules Reference</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-4 px-4 font-bold text-gray-900">Rule Type</th>
                              <th className="text-left py-4 px-4 font-bold text-gray-900">Description</th>
                              <th className="text-left py-4 px-4 font-bold text-gray-900">Options</th>
                              <th className="text-left py-4 px-4 font-bold text-gray-900">Example</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-white transition-colors">
                              <td className="py-4 px-4"><code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">required</code></td>
                              <td className="py-4 px-4 text-gray-700">Field must have a value</td>
                              <td className="py-4 px-4 text-gray-600">message?</td>
                              <td className="py-4 px-4"><code className="text-sm">type: 'required' </code></td>
                            </tr>
                            <tr className="hover:bg-white transition-colors">
                              <td className="py-4 px-4"><code className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-sm">email</code></td>
                              <td className="py-4 px-4 text-gray-700">Valid email format</td>
                              <td className="py-4 px-4 text-gray-600">message?</td>
                              <td className="py-4 px-4"><code className="text-sm">type: 'email' </code></td>
                            </tr>
                            <tr className="hover:bg-white transition-colors">
                              <td className="py-4 px-4"><code className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-sm">minLength</code></td>
                              <td className="py-4 px-4 text-gray-700">Minimum character count</td>
                              <td className="py-4 px-4 text-gray-600">length, message?</td>
                              <td className="py-4 px-4"><code className="text-sm">type: 'minLength', length: 8 </code></td>
                            </tr>
                            <tr className="hover:bg-white transition-colors">
                              <td className="py-4 px-4"><code className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-mono text-sm">custom</code></td>
                              <td className="py-4 px-4 text-gray-700">Custom validation function</td>
                              <td className="py-4 px-4 text-gray-600">validate, message?</td>
                              <td className="py-4 px-4"><code className="text-sm">type: 'custom', validate: fn </code></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'global-forms' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <Globe className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">Global Forms</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Global State?</h3>
                      <p className="text-lg text-gray-700 mb-6">
                        FormFlex's global state management allows you to share form state across components
                        without prop drilling. Perfect for multi-step forms, wizard interfaces, or any
                        scenario where form data needs to be accessible globally.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                            <h4 className="font-bold text-gray-900">Benefits</h4>
                          </div>
                          <ul className="space-y-2 text-gray-600">
                            <li>• Share state across components</li>
                            <li>• Persist data during navigation</li>
                            <li>• Centralized validation</li>
                            <li>• Optimistic updates</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-gray-900">Performance</h4>
                          </div>
                          <ul className="space-y-2 text-gray-600">
                            <li>• Minimal re-renders</li>
                            <li>• Smart dependencies</li>
                            <li>• Efficient storage</li>
                            <li>• Lazy validation</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <CodeBlock code={codeExamples.global} id="global-example" />

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="ml-3">
                          <h4 className="text-lg font-semibold text-amber-900 mb-2">Important Note</h4>
                          <p className="text-amber-800">
                            Global forms must be initialized before they can be used. Consider initializing
                            them in your app's root component or in a custom hook to ensure they're available
                            throughout your application.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">Advanced Features</h2>
                  </div>
                  
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Optimistic Updates</h3>
                      <p className="text-lg text-gray-700 mb-6">
                        FormFlex updates the UI immediately when users interact with form fields,
                        providing instant feedback while validation runs in the background.
                      </p>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Play className="w-5 h-5 text-blue-600 mr-2" />
                          How it Works
                        </h4>
                        <div className="grid md:grid-cols-5 gap-4">
                          {[
                            "User types",
                            "UI updates",
                            "Validation runs",
                            "Error appears",
                            "Success clears"
                          ].map((step, index) => (
                            <div key={index} className="text-center">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2 mx-auto">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Custom Validation & Async</h3>
                      <CodeBlock code={codeExamples.advanced} id="advanced-example" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Shield className="w-5 h-5 text-green-600 mr-2" />
                          Field Dependencies
                        </h4>
                        <p className="text-gray-700 mb-4">
                          Automatic handling of field dependencies for confirmation fields and matching validations.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Password confirmation</li>
                          <li>• Email verification</li>
                          <li>• Conditional validation</li>
                          <li>• Smart re-validation</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Zap className="w-5 h-5 text-purple-600 mr-2" />
                          Performance Optimized
                        </h4>
                        <p className="text-gray-700 mb-4">
                          Built-in optimizations ensure smooth performance even with complex forms.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Debounced validation</li>
                          <li>• Lazy evaluation</li>
                          <li>• Minimal re-renders</li>
                          <li>• Memory efficient</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <div className="flex items-center space-x-3 mb-8">
                    <Code className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900">API Reference</h2>
                  </div>
                  
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">useFormValidator</h3>
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Signature</h4>
                        <code className="text-sm bg-white px-3 py-2 rounded border">
                          useFormValidator&lt;T&gt;(initial: T, rules: Rules&lt;T&gt;, options?: Options)
                        </code>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Parameters</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <code className="font-bold text-blue-800">initial: T</code>
                              <p className="text-sm text-gray-600 mt-1">Initial form values</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <code className="font-bold text-green-800">rules: Rules&lt;T&gt;</code>
                              <p className="text-sm text-gray-600 mt-1">Validation rules for each field</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <code className="font-bold text-purple-800">options?: Options</code>
                              <p className="text-sm text-gray-600 mt-1">Configuration options</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Return Value</h4>
                          <div className="bg-gray-900 rounded-lg p-4 text-sm">
                            <pre className="text-green-400">
{`{
  values: T;
  errors: ErrorMap<T>;
  setField: (key, value) => void;
  validateForm: () => Result;
  isValid: boolean;
  // ... more methods
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Configuration Options</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-3">Validation Timing</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li><code>validateOnChange</code> - Real-time validation</li>
                            <li><code>validateOnBlur</code> - Validate on focus loss</li>
                            <li><code>debounce</code> - Delay validation</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-3">Performance</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li><code>optimistic</code> - Optimistic updates</li>
                            <li><code>lazy</code> - Lazy validation</li>
                            <li><code>memoize</code> - Cache results</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-3">Behavior</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li><code>resetOnSubmit</code> - Auto reset</li>
                            <li><code>focusOnError</code> - Focus invalid field</li>
                            <li><code>scrollToError</code> - Scroll to error</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div style={{width: '250px', height: '100px'}}>
                  <img src={logo} style={{width: '100%', height: '100%', ObjectFit: 'contain'}} />
                </div>
                {/* <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
                </div>
                <h3 className="text-2xl font-bold">FormFlex</h3> */}
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                The ultimate React form validation framework for modern applications.
                Built with performance, developer experience, and flexibility in mind.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><BookOpen className="w-4 h-4" /><span>Documentation</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><Play className="w-4 h-4" /><span>Examples</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><Github className="w-4 h-4" /><span>GitHub</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><Download className="w-4 h-4" /><span>NPM Package</span></a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Community</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><Users className="w-4 h-4" /><span>Discord</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><ExternalLink className="w-4 h-4" /><span>Twitter</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><AlertCircle className="w-4 h-4" /><span>Issues</span></a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><Globe className="w-4 h-4" /><span>Discussions</span></a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>&copy; 2024 FormFlex. MIT License. Built with ❤️ for developers.</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>v2.1.0</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">FormFlex</h2>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <a href="#" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-xl font-semibold mb-3">
                  Get Started
                </a>
                <a href="#" className="block w-full border-2 border-gray-300 text-center py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors">
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 z-40"
      >
        <ChevronRight className="w-5 h-5 transform -rotate-90" />
      </button>
    </div>
  );
};

export default FormFlexDocs;
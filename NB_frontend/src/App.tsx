import { useState } from 'react';
import axios from 'axios';
import './App.css';

interface StringDictionary {
  [key: string]: string;
}

interface CategoryOption {
  category: string;
  values: string[];
  type?: 'select' | 'number' | 'radio';
  min?: number;
  max?: number;
  step?: number;
}

interface BackendResponse {
  result: {
    employee_residence: string[];
  };
}

function App() {
  const [result, setResult] = useState<BackendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<StringDictionary>({});

  const options: CategoryOption[] = [
    { 
      category: 'work_year', 
      values: ['2020', '2021', '2022'],
      type: 'select'
    },
    { 
      category: 'experience_level', 
      values: ['MI', 'SE', 'EN', 'EX'],
      type: 'select'
    },
    { 
      category: 'employment_type', 
      values: ['FT', 'CT', 'PT', 'FL'],
      type: 'select'
    },
    { 
      category: 'job_title', 
      values: ['Data Scientist', 'Machine Learning Scientist', 'Big Data Engineer', 'Product Data Analyst', 'Machine Learning Engineer', 'Data Analyst', 'Lead Data Scientist', 'Business Data Analyst', 'Lead Data Engineer', 'Lead Data Analyst', 'Data Engineer', 'Data Science Consultant', 'BI Data Analyst', 'Director of Data Science', 'Research Scientist', 'Machine Learning Manager', 'Data Engineering Manager', 'Machine Learning Infrastructure Engineer', 'ML Engineer', 'AI Scientist', 'Computer Vision Engineer', 'Principal Data Scientist', 'Data Science Manager', 'Head of Data', '3D Computer Vision Researcher', 'Data Analytics Engineer', 'Applied Data Scientist', 'Marketing Data Analyst', 'Cloud Data Engineer', 'Financial Data Analyst', 'Computer Vision Software Engineer', 'Director of Data Engineering', 'Data Science Engineer', 'Principal Data Engineer', 'Machine Learning Developer', 'Applied Machine Learning Scientist', 'Data Analytics Manager', 'Head of Data Science', 'Data Specialist', 'Data Architect', 'Finance Data Analyst', 'Principal Data Analyst', 'Big Data Architect', 'Staff Data Scientist', 'Analytics Engineer', 'ETL Developer', 'Head of Machine Learning', 'NLP Engineer', 'Lead Machine Learning Engineer', 'Data Analytics Lead'],
      type: 'select'
    },
    { 
      category: 'salary_in_usd', 
      type: 'number',
      values: [],
      min: 0,
      max: 1000000,
      step: 1000
    },
    { 
      category: 'remote_ratio', 
      values: ['0', '50', '100'],
      type: 'radio'
    },
    { 
      category: 'company_location', 
      values: ['DE', 'JP', 'GB', 'HN', 'US', 'HU', 'NZ', 'FR', 'IN', 'PK', 'CN', 'GR', 'AE', 'NL', 'MX', 'CA', 'AT', 'NG', 'ES', 'PT', 'DK', 'IT', 'HR', 'LU', 'PL', 'SG', 'RO', 'IQ', 'BR', 'BE', 'UA', 'IL', 'RU', 'MT', 'CL', 'IR', 'CO', 'MD', 'KE', 'SI', 'CH', 'VN', 'AS', 'TR', 'CZ', 'DZ', 'EE', 'MY', 'AU', 'IE'],
      type: 'select'
    },
    { 
      category: 'company_size', 
      values: ['L', 'S', 'M'],
      type: 'radio'
    },
  ];

  const handleRunScript = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/getInference/run-script/', {
        value: selectedValue
      });
      setResult(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
      setError(error.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValueSelect = (category: string, value: string) => {
    setSelectedValue((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const renderInput = (option: CategoryOption) => {
    switch (option.type) {
      case 'number':
        return (
          <input
            type="number"
            min={option.min}
            max={option.max}
            step={option.step}
            value={selectedValue[option.category] || ''}
            onChange={(e) => handleValueSelect(option.category, e.target.value)}
            className="form-input"
          />
        );
      case 'radio':
        return (
          <div className="radio-group">
            {option.values.map((value) => (
              <label key={value} className="radio-label">
                <input
                  type="radio"
                  name={option.category}
                  value={value}
                  checked={selectedValue[option.category] === value}
                  onChange={(e) => handleValueSelect(option.category, e.target.value)}
                />
                {option.category === 'remote_ratio' 
                  ? value === '0' ? 'No Remote' : value === '50' ? 'Hybrid' : 'Full Remote'
                  : value}
              </label>
            ))}
          </div>
        );
      case 'select':
      default:
        return (
          <select
            value={selectedValue[option.category] || ''}
            onChange={(e) => handleValueSelect(option.category, e.target.value)}
            className="form-select"
          >
            <option value="">Select {option.category.replace(/_/g, ' ')}</option>
            {option.values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        );
    }
  };

  return (
    <div className="container">
      <h1>Predict Employee Nationality</h1>
      
      <div className="form-container">
        {options.map((option) => (
          <div key={option.category} className="form-group">
            <label className="form-label">
              {option.category.replace(/_/g, ' ').toUpperCase()}:
            </label>
            {renderInput(option)}
          </div>
        ))}

        <button 
          onClick={handleRunScript} 
          disabled={loading || Object.keys(selectedValue).length === 0}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Predicting...' : 'Predict Nationality'}
        </button>
      </div>

      {error && (
        <div className="error-container">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <h3>Result:</h3>
          <div>
            <strong>Employee Residence Prediction:</strong>
            <ul className="prediction-list">
              {result.result.employee_residence.map((residence, index) => (
                <li key={index} className="prediction-item">
                  <strong>{residence}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
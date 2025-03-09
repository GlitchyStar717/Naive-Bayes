import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './NaiveBayesVisualization.css';
import "./Form.css"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface FeatureContribution {
  feature: string;
  likelihood: number;
}

interface CalculationStep {
  features: Record<string, { prior: number }>;
  class_probabilities: Record<string, { prior: number }>;
  feature_contributions: Record<string, FeatureContribution[]>;
  final_probabilities: Record<string, number>;
}

interface Props {
  calculationSteps: CalculationStep[];
}

export const NaiveBayesVisualization = ({ calculationSteps }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const steps = [
    {
      title: "Step 1: Prior Probabilities",
      description: "First, we calculate the initial probability of each class based on training data. This represents our prior belief before considering any features."
    },
    {
      title: "Step 2: Feature Likelihoods",
      description: "For each feature, we calculate the probability of observing that feature given each class. This helps us understand how indicative each feature is of a particular class."
    },
    {
      title: "Step 3: Posterior Probabilities",
      description: "Finally, we combine prior probabilities with feature likelihoods using Bayes' theorem to get the final probability distribution across classes."
    }
  ];

  useEffect(() => {
    if (calculationSteps?.length > 0) {
      const finalProbs = calculationSteps[0].final_probabilities;
      const topCountry = Object.entries(finalProbs)
        .sort(([, a], [, b]) => b - a)[0][0];
      setSelectedCountry(topCountry);
    }
  }, [calculationSteps]);

  const handleNextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setIsAnimating(false);
    }, 500);
  };

  const handlePrevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      setIsAnimating(false);
    }, 500);
  };

  if (!calculationSteps?.length) {
    return (
      <div className="naive-bayes-visualization">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const step = calculationSteps[0];
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 }
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 }
        },
      },
    },
  };

  // Helper function to normalize probabilities
  const normalizeProbabilities = (probabilities: Record<string, number>) => {
    const total = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    return Object.fromEntries(
      Object.entries(probabilities).map(([key, value]) => [
        key,
        total > 0 ? (value / total) * 100 : 0
      ])
    );
  };

  // Get the prediction result from the calculation steps
  const getPredictionResult = () => {
    if (!calculationSteps?.length) return null;
    const finalProbs = calculationSteps[0].final_probabilities;
    const sorted = Object.entries(finalProbs)
      .sort(([, a], [, b]) => b - a);
    return {
      country: sorted[0][0],
      probability: sorted[0][1] * 100
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Prior Probabilities
        const priorProbabilities = step.class_probabilities || {};
        
        // Sort countries by prior probability and get top 10
        const sortedCountries = Object.entries(priorProbabilities)
          .sort(([, a], [, b]) => b.prior - a.prior);
        
        const allCountries = sortedCountries.map(([country]) => country);
        const top10Countries = sortedCountries.slice(0, 10);
        
        const priorData = {
          labels: allCountries,
          datasets: [{
            data: allCountries.map(country => priorProbabilities[country].prior * 100),
            backgroundColor: getGradientColors(allCountries.length),
            borderWidth: 1,
          }],
        };

        return (
          <div className={`step-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <div className="step-visualization">
              <div className="chart-container">
                <Pie 
                  data={priorData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        callbacks: {
                          label: (context: any) => {
                            const label = context.label || '';
                            const value = context.raw.toFixed(2);
                            return `${label}: ${value}%`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
              <div className="probability-legend">
                <h5 className="legend-title">Top 10 Countries by Prior Probability</h5>
                {top10Countries.map(([country, data], index) => (
                  <div key={country} className="legend-item">
                    <span className="legend-rank">{index + 1}</span>
                    <span 
                      className="legend-color" 
                      style={{ 
                        backgroundColor: getGradientColors(allCountries.length)[
                          allCountries.indexOf(country)
                        ]
                      }}
                    />
                    <span className="legend-label">{country}</span>
                    <span className="legend-value">{(data.prior * 100).toFixed(2)}%</span>
                  </div>
                ))}
                <div className="legend-footer">
                  <span className="legend-note">
                    * Showing top 10 out of {allCountries.length} countries
                  </span>
                </div>
              </div>
            </div>
            <div className="step-formula">
              <h4>Prior Probability Formula:</h4>
              <p>P(Class) = Count(Class) / Total_Samples</p>
              <div className="formula-explanation">
                <p>This represents the initial probability distribution of each country 
                   based on the training data, before considering any features.</p>
              </div>
            </div>
          </div>
        );

      case 1:
        // Feature Likelihoods
        const featureContributions = step.feature_contributions[selectedCountry] || [];
        const significantFeatures = featureContributions
          .filter((fc: any) => fc.likelihood > 0.0001) // Filter very small values
          .sort((a: any, b: any) => b.likelihood - a.likelihood)
          .slice(0, 10); // Show top 10 most significant features

        const totalLikelihood = significantFeatures.reduce((sum: number, fc: any) => sum + fc.likelihood, 0);
        
        const featureData = {
          labels: significantFeatures.map((fc: any) => fc.feature),
          datasets: [{
            label: 'Feature Impact',
            data: significantFeatures.map((fc: any) => (fc.likelihood / totalLikelihood * 100)),
            backgroundColor: 'rgba(0, 180, 216, 0.8)',
            borderRadius: 4,
          }],
        };

        return (
          <div className={`step-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <div className="feature-selector">
              <label>Select Country for Feature Analysis:</label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="country-select"
              >
                {Object.keys(step.feature_contributions).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="step-visualization">
              <Bar 
                data={featureData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Top 10 Most Influential Features',
                      color: '#fff'
                    },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => `Impact: ${context.raw.toFixed(2)}%`
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Relative Impact (%)',
                        color: '#fff'
                      },
                      max: 100
                    }
                  }
                }}
              />
            </div>
            <div className="step-formula">
              <h4>Likelihood Calculation:</h4>
              <p>Relative Impact = (Feature Likelihood / Total Likelihood) × 100%</p>
              <div className="formula-explanation">
                <p>Shows how much each feature contributes to the prediction for {selectedCountry}. 
                   Higher percentages indicate stronger influence on the final prediction.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        // Get the prediction result
        const prediction = getPredictionResult();
        if (!prediction) return null;

        // Posterior Probabilities
        const posteriorProbabilities = Object.entries(step.final_probabilities)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10); // Show top 10 countries
        
        const posteriorData = {
          labels: posteriorProbabilities.map(([country]) => country),
          datasets: [{
            label: 'Probability',
            data: posteriorProbabilities.map(([, prob]) => prob * 100),
            backgroundColor: getGradientColors(posteriorProbabilities.length),
            borderRadius: 4,
          }],
        };

        return (
          <div className={`step-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <div className="prediction-summary">
              <h4>Final Prediction</h4>
              <div className="prediction-result">
                <span className="predicted-country">{prediction.country}</span>
                <span className="predicted-probability">
                  {prediction.probability.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="step-visualization">
              <Bar 
                data={posteriorData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'Top 10 Most Likely Countries',
                      color: '#fff'
                    },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => `Probability: ${(context.raw).toFixed(2)}%`
                      }
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Probability (%)',
                        color: '#fff'
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="probability-details">
              {posteriorProbabilities.map(([country, prob], index) => (
                <div key={country} className={`probability-item ${country === prediction.country ? 'highlighted' : ''}`}>
                  <span className="rank">{index + 1}</span>
                  <span className="country">{country}</span>
                  <span className="probability">{(prob * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
            <div className="step-formula">
              <h4>Final Probability:</h4>
              <p>P(Class|Features) ∝ P(Class) × ∏ P(Feature|Class)</p>
              <div className="formula-explanation">
                <p>The final probabilities show the likelihood of each country being 
                   the correct prediction, based on both prior probabilities and feature evidence.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="naive-bayes-visualization">
      <div className="step-header">
        <h3>{steps[currentStep].title}</h3>
        <p className="step-description">{steps[currentStep].description}</p>
      </div>

      {renderStepContent()}

      <div className="step-navigation">
        <button 
          onClick={handlePrevStep} 
          disabled={currentStep === 0}
          className="nav-button"
        >
          Previous Step
        </button>
        <div className="step-indicators">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`step-dot ${index === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
        <button 
          onClick={handleNextStep} 
          disabled={currentStep === steps.length - 1}
          className="nav-button"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

const getGradientColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count;
    return `hsla(${hue}, 80%, 65%, 0.8)`;
  });
};

// Ensure Bar chart uses full width
const renderBarChart = (data: any) => (
  <div className="bar-chart-container">
    <Bar data={data} options={chartOptions} />
  </div>
);

// Ensure Pie chart maintains aspect ratio
const renderPieChart = (data: any) => (
  <div className="pie-chart-container">
    <Pie data={data} options={chartOptions} />
  </div>
); 
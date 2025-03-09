import React, { useState } from 'react';
import axios from 'axios';

interface StringDictionary {
  [key: string]: string;
}

interface CategoryOption {
  category: string;
  values: string[];
}

interface BackendResponse {
  result:{
    employee_residence:string[];
  };
}

function App() {
  const [result, setResult] = useState<BackendResponse|null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedValue, setSelectedValue] = useState<StringDictionary>({});
  
  const options: CategoryOption[] = [
    { category: 'work_year', values: ['2020', '2021', '2022'] },
    { category: 'experience_level', values: ['MI', 'SE', 'EN', 'EX'] },
    { category: 'employment_type', values: ['FT', 'CT', 'PT', 'FL'] },
    { category: 'job_title', values: ['Data Scientist', 'Machine Learning Scientist', 'Big Data Engineer', 'Product Data Analyst', 'Machine Learning Engineer', 'Data Analyst', 'Lead Data Scientist', 'Business Data Analyst', 'Lead Data Engineer', 'Lead Data Analyst', 'Data Engineer', 'Data Science Consultant', 'BI Data Analyst', 'Director of Data Science', 'Research Scientist', 'Machine Learning Manager', 'Data Engineering Manager', 'Machine Learning Infrastructure Engineer', 'ML Engineer', 'AI Scientist', 'Computer Vision Engineer', 'Principal Data Scientist', 'Data Science Manager', 'Head of Data', '3D Computer Vision Researcher', 'Data Analytics Engineer', 'Applied Data Scientist', 'Marketing Data Analyst', 'Cloud Data Engineer', 'Financial Data Analyst', 'Computer Vision Software Engineer', 'Director of Data Engineering', 'Data Science Engineer', 'Principal Data Engineer', 'Machine Learning Developer', 'Applied Machine Learning Scientist', 'Data Analytics Manager', 'Head of Data Science', 'Data Specialist', 'Data Architect', 'Finance Data Analyst', 'Principal Data Analyst', 'Big Data Architect', 'Staff Data Scientist', 'Analytics Engineer', 'ETL Developer', 'Head of Machine Learning', 'NLP Engineer', 'Lead Machine Learning Engineer', 'Data Analytics Lead'] },
    { category: 'salary_in_usd', values: ['79833', '260000', '109024', '20000', '150000', '72000', '190000', '35735', '135000', '125000', '51321', '40481', '39916', '87000', '85000', '8000', '41689', '114047', '5707', '56000', '43331', '6072', '47899', '98000', '115000', '325000', '42000', '33511', '100000', '117104', '59303', '70000', '68428', '450000', '46759', '74130', '103000', '250000', '10000', '138000', '45760', '50180', '106000', '112872', '15966', '76958', '188000', '105000', '70139', '91000', '45896', '54742', '60000', '148261', '38776', '118000', '120000', '138350', '110000', '130800', '21669', '412000', '45618', '62726', '49268', '190200', '91237', '42197', '82528', '235000', '53192', '5409', '270000', '80000', '79197', '140000', '54238', '47282', '153667', '28476', '59102', '170000', '88654', '76833', '19609', '276000', '29751', '89294', '12000', '95746', '75000', '36259', '62000', '73000', '51519', '187442', '30428', '94564', '113476', '103160', '45391', '225000', '50000', '40189', '90000', '200000', '110037', '10354', '151000', '9466', '40570', '49646', '38400', '24000', '63711', '77364', '220000', '240000', '82500', '82744', '62649', '153000', '160000', '168000', '75774', '13400', '144000', '127221', '119059', '423000', '230000', '28369', '63831', '130026', '165000', '55000', '60757', '174000', '2859', '40038', '81000', '5679', '22611', '90734', '26005', '61896', '4000', '69741', '74000', '152000', '21844', '18000', '96113', '147000', '9272', '24342', '54094', '61467', '195000', '37825', '12901', '24823', '56738', '66022', '5882', '185000', '28609', '46597', '116914', '33808', '56256', '416000', '87738', '71786', '16228', '256000', '180000', '63810', '46809', '21637', '103691', '18053', '72212', '36643', '12103', '96282', '600000', '28399', '93000', '99703', '173762', '141846', '130000', '16904', '66265', '25532', '93150', '111775', '28016', '65013', '72500', '18907', '77684', '58000', '20171', '112000', '69999', '94665', '102839', '109000', '51064', '155000', '120600', '102100', '84900', '136620', '99360', '117789', '104702', '146000', '123000', '52351', '99000', '116000', '106260', '126500', '242000', '65438', '39263', '78526', '165220', '45807', '120160', '90320', '181940', '132320', '220110', '160080', '124190', '115500', '112900', '165400', '167000', '243900', '136600', '109280', '128875', '93700', '224000', '167875', '175000', '156600', '108800', '95550', '113000', '161342', '137141', '211500', '192400', '90700', '61300', '138600', '136000', '189650', '164996', '54957', '118187', '132000', '208775', '147800', '136994', '101570', '79039', '37300', '164000', '124333', '98158', '145000', '105400', '87932', '215300', '158200', '209100', '154600', '115934', '81666', '183600', '71982', '65949', '49461', '58894', '63900', '112300', '241000', '159000', '82900', '100800', '140400', '43966', '32974', '76940', '91614', '21983', '78791', '196979', '37236', '18442', '31615', '58255', '162674', '104890', '183228', '185100', '65000', '324000', '216000', '210000', '31875', '35590', '58035', '93427', '52396', '62651', '40000', '87425', '86703', '64849', '157000', '70912', '71444', '48000', '152500', '68147', '122346', '380000', '69336', '405000', '177000', '78000', '214000', '192600', '266400', '213120', '141300', '206699', '99100', '110500', '99050', '205300', '176000', '200100', '70500', '184700', '175100', '140250', '116150', '54000', '69000', '150075', '25000', '110925', '192564', '144854', '150260', '67000', '52000', '154000', '126000', '129000'] },
    { category: 'employee_residence', values: ['DE', 'JP', 'GB', 'HN', 'US', 'HU', 'NZ', 'FR', 'IN', 'PK', 'PL', 'PT', 'CN', 'GR', 'AE', 'NL', 'MX', 'CA', 'AT', 'NG', 'PH', 'ES', 'DK', 'RU', 'IT', 'HR', 'BG', 'SG', 'BR', 'IQ', 'VN', 'BE', 'UA', 'MT', 'CL', 'RO', 'IR', 'CO', 'MD', 'KE', 'SI', 'HK', 'TR', 'RS', 'PR', 'LU', 'JE', 'CZ', 'AR', 'DZ', 'TN', 'MY', 'EE', 'AU', 'BO', 'IE', 'CH'] },
    { category: 'remote_ratio', values: ['0', '50', '100'] },
    { category: 'company_location', values: ['DE', 'JP', 'GB', 'HN', 'US', 'HU', 'NZ', 'FR', 'IN', 'PK', 'CN', 'GR', 'AE', 'NL', 'MX', 'CA', 'AT', 'NG', 'ES', 'PT', 'DK', 'IT', 'HR', 'LU', 'PL', 'SG', 'RO', 'IQ', 'BR', 'BE', 'UA', 'IL', 'RU', 'MT', 'CL', 'IR', 'CO', 'MD', 'KE', 'SI', 'CH', 'VN', 'AS', 'TR', 'CZ', 'DZ', 'EE', 'MY', 'AU', 'IE'] },
    { category: 'company_size', values: ['L', 'S', 'M'] },
  ];

  const handleRunScript = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/getInference/run-script/', {
        // category: selectedCategory?.category,
        value: selectedValue
      });
      setResult(response.data);
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

  return (
    <div className="App">
      <h3>Find Nationality based on Job Description</h3>
      <label>Select the person's description on all fields:</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
        {options.map((group, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(group)}
            style={{
              margin: '5px',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              border: '1px solid black',
              color: 'black',
              backgroundColor: selectedCategory?.category === group.category ? '#28a745' : 'grey'
            }}
          >
            {group.category}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div>
          <h3>Select a Value for {selectedCategory.category}:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
            {selectedCategory.values.map((value, idx) => (
              <button
                key={idx}
                onClick={() => handleValueSelect(selectedCategory.category, value)}
                style={{
                  margin: "5px",
                  padding: "10px",
                  backgroundColor: selectedValue[selectedCategory.category] === value ? "#28a745" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}

      <h3>Selected Values:</h3>
      <ul>
        {Object.entries(selectedValue).map(([category, value]) => (
          <li key={category}>
            <strong>{category}</strong>: {value}
          </li>
        ))}
      </ul>

      <div>
        <button 
          onClick={handleRunScript} 
          disabled={loading || Object.keys(selectedValue).length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '15px'
          }}
        >
          {loading ? 'Loading...' : 'Run Inference'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffdddd', borderRadius: '5px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#222222', borderRadius: '5px' }}>
          <h3>Result:</h3>
          <div>
            <strong>Employee Residence Prediction:</strong>
            <ul style={{ listStyleType: 'none', padding: '10px', borderRadius: '5px' }}>
              {result.result.employee_residence.map((residence, index) => (
                <li key={index} style={{ padding: '5px', margin: '5px 0', backgroundColor: 'grey', color: 'white', borderRadius: '3px' , textAlign: 'center'}}>
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
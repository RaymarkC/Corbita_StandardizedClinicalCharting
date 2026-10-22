import React, { useState } from 'react';
import { 
  Activity, 
  User, 
  FileText, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Code, 
  ChevronRight,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [showJson, setShowJson] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Case study presets
  const presets = {
    t2dm: {
      patient: { id: "PT-90412", name: "John Doe", age: 58, gender: "Male", height: 175, weight: 96.2, encounter: "ENC-2026-8812" },
      assessment: {
        anthropometrics: [
          { code: "AD-1.1.1", term: "Height", value: "175", unit: "cm" },
          { code: "AD-1.1.2", term: "Body Mass Index (BMI)", value: "31.4", unit: "kg/m²" }
        ],
        biochemical: [
          { code: "BD-1.5.1", term: "Fasting Blood Glucose", value: "142", unit: "mg/dL" },
          { code: "BD-1.5.2", term: "HbA1c", value: "8.2", unit: "%" }
        ]
      },
      diagnosis: {
        code: "NI-5.4",
        term: "Inappropriate Intake of Types of Carbohydrates",
        etiology: "lack of prior diet instruction regarding consistent carbohydrate intake",
        signs: ["HbA1c of 8.2%", "reported daily intake of 4-5 sugar-sweetened beverages"]
      },
      intervention: [
        { code: "E-1.1", term: "Initial/Brief Nutrition Education", details: "Educated on carbohydrate counting and reading nutrition labels." }
      ],
      monitoring: [
        { code: "BD-1.5.2", goal: "Reduce HbA1c to < 7.0%", timeframe: "12 weeks" }
      ]
    }
  };

  const [formData, setFormData] = useState(presets.t2dm);

  // Auto-calculated BMI
  const heightM = (parseFloat(formData.patient.height) || 0) / 100;
  const weightKg = parseFloat(formData.patient.weight) || 0;
  const calculatedBmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : "0";

  // PES Statement Auto-Generator
  const pesStatement = `${formData.diagnosis.term} (${formData.diagnosis.code}) related to ${formData.diagnosis.etiology} as evidenced by ${formData.diagnosis.signs.join(', ')}.`;

  // Full eNCPT JSON Payload Data Structure
  const payloadData = {
    encounter_id: formData.patient.encounter,
    patient_id: formData.patient.id,
    timestamp: new Date().toISOString(),
    nutrition_assessment: formData.assessment,
    nutrition_diagnosis: [{
      problem_code: formData.diagnosis.code,
      problem_term: formData.diagnosis.term,
      etiology: formData.diagnosis.etiology,
      signs_symptoms: formData.diagnosis.signs,
      pes_statement: pesStatement
    }],
    nutrition_intervention: formData.intervention,
    monitoring_evaluation: formData.monitoring
  };

  const handleSimulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApiResponse({
        status: 201,
        statusText: "Created",
        message: "eNCPT Record successfully validated and stored in EHR database.",
        record_id: "NCP-" + Math.floor(100000 + Math.random() * 900000)
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-7 w-7 text-emerald-400" />
          <div>
            <h1 className="font-bold text-xl tracking-tight">eNCPT Clinical Charting Module</h1>
            <p className="text-xs text-slate-400">Lab 3: Standardized Nutrition Care Process Terminology</p>
          </div>
        </div>
        <button 
          onClick={() => setShowJson(!showJson)}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm px-4 py-2 rounded-lg border border-slate-700 transition"
        >
          <Code className="h-4 w-4" />
          <span>{showJson ? "Hide JSON Schema" : "View Live JSON Payload"}</span>
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Patient Banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Banner</span>
              <h2 className="text-lg font-bold text-slate-900">{formData.patient.name} ({formData.patient.gender}, {formData.patient.age}y)</h2>
              <p className="text-xs text-slate-500">ID: {formData.patient.id} | Encounter: {formData.patient.encounter}</p>
            </div>
            <div className="flex gap-4 border-l pl-4 border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Height</p>
                <p className="font-semibold text-sm">{formData.patient.height} cm</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Weight</p>
                <p className="font-semibold text-sm">{formData.patient.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">BMI</p>
                <p className="font-semibold text-sm text-emerald-600">{calculatedBmi} kg/m²</p>
              </div>
            </div>
          </div>

          {/* Steps Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-4 bg-white px-4 rounded-xl shadow-sm border">
            {[
              { id: 'assessment', label: '1. Assessment (AD/BD)' },
              { id: 'diagnosis', label: '2. Diagnosis (PES)' },
              { id: 'intervention', label: '3. Intervention (NI)' },
              { id: 'monitoring', label: '4. Monitoring (ME)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id 
                    ? 'border-emerald-600 text-emerald-600 font-semibold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            
            {/* TAB 1: ASSESSMENT */}
            {activeTab === 'assessment' && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Nutrition Assessment Domains (eNCPT standard)
                </h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Anthropometrics (AD)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.assessment.anthropometrics.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <span className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-2">{item.code}</span>
                        <span className="font-medium text-slate-800">{item.term}:</span>
                        <span className="ml-2 text-slate-900 font-bold">{item.value} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Biochemical Data & Lab Tests (BD)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.assessment.biochemical.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <span className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-2">{item.code}</span>
                        <span className="font-medium text-slate-800">{item.term}:</span>
                        <span className="ml-2 text-slate-900 font-bold">{item.value} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIAGNOSIS (PES BUILDER) */}
            {activeTab === 'diagnosis' && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-900">PES Statement Builder (eNCPT Diagnosis)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Problem (P) Term & Code</label>
                    <input 
                      type="text" 
                      value={`${formData.diagnosis.term} (${formData.diagnosis.code})`}
                      onChange={(e) => setFormData({...formData, diagnosis: {...formData.diagnosis, term: e.target.value}})}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Etiology (E)</label>
                    <textarea 
                      value={formData.diagnosis.etiology}
                      onChange={(e) => setFormData({...formData, diagnosis: {...formData.diagnosis, etiology: e.target.value}})}
                      rows={2}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Signs & Symptoms (S)</label>
                    <p className="text-xs text-slate-500 mb-2">{formData.diagnosis.signs.join(', ')}</p>
                  </div>
                </div>

                {/* Live PES Preview */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Generated PES Output</span>
                  <p className="text-sm text-emerald-950 font-medium leading-relaxed">{pesStatement}</p>
                </div>
              </div>
            )}

            {/* TAB 3: INTERVENTION */}
            {activeTab === 'intervention' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Nutrition Intervention (NI Domain)</h3>
                {formData.intervention.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">{item.code}</span>
                      <span className="font-bold text-sm">{item.term}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.details}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: MONITORING */}
            {activeTab === 'monitoring' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Monitoring & Evaluation (ME Domain)</h3>
                {formData.monitoring.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-mono bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">{item.code}</span>
                      <p className="text-xs text-slate-700 mt-1 font-semibold">{item.goal}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-white border px-2.5 py-1 rounded-md">Timeframe: {item.timeframe}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Submit API Simulation Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSimulateSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-sm transition"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Transmitting eNCPT Payload..." : "Submit eNCPT Note to API"}</span>
            </button>
          </div>

          {/* Simulated API Response */}
          {apiResponse && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center text-emerald-400 font-bold space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>HTTP {apiResponse.status} {apiResponse.statusText}</span>
              </div>
              <p>{apiResponse.message}</p>
              <p className="text-slate-400">Assigned Record ID: <span className="text-white">{apiResponse.record_id}</span></p>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic JSON Payload Inspector */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Code className="h-4 w-4" />
                Live eNCPT JSON Stream
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                Valid Schema
              </span>
            </div>
            
            <pre className="text-[11px] leading-relaxed font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto text-emerald-300 max-h-[500px]">
              {JSON.stringify(payloadData, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
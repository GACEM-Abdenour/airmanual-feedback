import { BookOpen, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, Layers, Layout, Activity, Info } from 'lucide-react';

export function SymptomPatternArchitecture() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Section */}
      <div className="border-b border-borderMain pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <ShieldAlert className="w-8 h-8 mr-4 text-primary" />
          AeroMind Symptom-Pattern Architecture
        </h1>
        <p className="text-textMuted mt-3 text-lg max-w-3xl">
          Comprehensive documentation of the diagnostic architecture designed to structure maintenance guidance for the Robinson R44.
        </p>
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-200">
            <strong>Experimental Concept:</strong> This architecture was conceived and designed by Abdenour, the AI engineer, driven by his own creativity rather than established aviation standards. As such, it is not considered fully reliable for the stringent aircraft world. It was created primarily to fill existing data gaps and establish a foundation that invites critique, debate, and continuous feedback if the project continues.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-indigo-400" />
          The Intended Architecture
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface border border-borderMain rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
              Origins & Rationale
            </h3>
            <p className="text-sm text-textMuted leading-relaxed mb-4">
              General retrieval pipelines often treat all queries equally, leading to flat or disjointed answers. 
              Abdenour designed the Symptom-Pattern Architecture to enforce a rigid, structured template over the AI. 
              By forcing the system to check safety gates, consult appropriate manuals (MM vs POH), and provide a complete inspection path, 
              this creative measure attempts to simulate a more logical diagnostic flow, opening the door for continuous feedback.
            </p>
          </div>

          <div className="bg-surface border border-borderMain rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-emerald-500" />
              Target Behavior
            </h3>
            <p className="text-sm text-textMuted mb-4">
              Rather than responding with a single ad-hoc cause, the architecture aims to:
            </p>
            <ul className="space-y-3">
              <li className="text-sm text-textMuted flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0"></div>
                Recognize the specific symptom family.
              </li>
              <li className="text-sm text-textMuted flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0"></div>
                Trigger safety gates immediately (e.g., "Do not fly if fuel smell").
              </li>
              <li className="text-sm text-textMuted flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0"></div>
                Map all probable causes derived from the MM and output a sequential inspection path.
              </li>
            </ul>
          </div>
        </div>

        {/* Task Categories & Families */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface border border-borderMain rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-blue-400" />
              Engineering Task Categories
            </h3>
            <ul className="space-y-2">
              {['Fault Diagnosis', 'Parts Identification', 'Maintenance Procedure', 'Electrical Troubleshooting', 'Limits & Specifications', 'Airworthiness & Compliance'].map((task, i) => (
                <li key={i} className="text-sm text-textMuted flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  {task}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-borderMain rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Primary Symptom Families
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Vibration / Shaking', 'Main Rotor Track / Balance', 'Tail Rotor / Yaw', 'Fuel Smell / Leak',
                'Drive System / Belts', 'Warning / Caution Lights', 'Engine Roughness', 'Electrical Faults',
                'Hydraulic Stiffness', 'Smoke / Fumes / Odor', 'Oil Pressure / Temp', 'Carb / Induction'
              ].map((family, i) => (
                <div key={i} className="text-xs text-textMuted bg-background p-2 rounded border border-borderMain">
                  {family}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Answer Modes & Source Rules */}
        <div className="bg-surface border border-borderMain rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Layout className="w-5 h-5 mr-2 text-primary" />
            Answer Modes & Source Grounding Rules
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Answer Modes</h4>
              <ul className="space-y-3">
                <li className="text-sm">
                  <span className="text-indigo-400 font-mono block mb-1">complete_inspection_sequence</span>
                  <span className="text-textMuted">The default output for new symptoms. Provides safety gates, required context, probable cause map, and the full sequential inspection path.</span>
                </li>
                <li className="text-sm">
                  <span className="text-emerald-400 font-mono block mb-1">guided_diagnostic_continuation</span>
                  <span className="text-textMuted">Stateful follow-up. Acknowledges what the user ruled out and provides the next logical branch from the inspection path.</span>
                </li>
                <li className="text-sm">
                  <span className="text-red-400 font-mono block mb-1">no_source_guard</span>
                  <span className="text-textMuted">Triggered when official MM/POH sources are missing. Transparently refuses to invent maintenance procedures.</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Source Grounding Rules</h4>
              <ul className="space-y-2 text-sm text-textMuted">
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Always prioritize POH for emergency/flight safety context.</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Route physical defect diagnosis strictly to the Maintenance Manual (MM).</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Use IPC strictly for part identification.</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Restrict Service Bulletins (SB) and ADs to compliance tasks unless they directly modify an MM procedure.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations & Engineer Review */}
      <div className="bg-surface border border-borderMain rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-amber-400" />
          Limitations & Continuous Feedback
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Experimental Context</h4>
            <ul className="space-y-2 text-sm text-textMuted list-disc pl-4">
              <li>Because this was created out of Abdenour's creativity to fill data gaps, it requires heavy criticism and continuous feedback to become robust.</li>
              <li>System is currently modeled on R44 scopes; expanding to R66 requires separate engine logic due to turbine differences.</li>
              <li>Feedback handling loops (`guided_diagnostic_continuation`) rely heavily on accurate mechanic input; bad input can still lead to misdiagnosis.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Pending Engineer Review</h4>
            <ul className="space-y-2 text-sm text-textMuted list-disc pl-4">
              <li>Licensed engineers must review the 12 Symptom Families to validate whether this creative approach is actually viable.</li>
              <li>Verify that no explicit prohibited behaviors (e.g. advising flight with fuel smell) can be bypassed via prompt injection.</li>
              <li>Ensure compliance boundaries (AD/SB vs MM) are legally sound per local aviation authorities.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

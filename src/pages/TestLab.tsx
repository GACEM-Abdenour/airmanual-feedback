import { useNavigate } from 'react-router-dom';
import { Beaker, CheckCircle2, CircleDashed, Lock, ArrowRight, Activity, ShieldCheck, Scale, MessageSquare } from 'lucide-react';

export function TestLab() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. Hero / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-borderMain pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Beaker className="w-8 h-8 mr-3 text-primary" />
              AeroMind Test Lab
            </h1>
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center">
              <CircleDashed className="w-3 h-3 mr-1.5 animate-pulse" />
              Waiting for engineering policies
            </span>
          </div>
          <p className="text-textMuted mt-2 max-w-2xl">
            Compare advanced AI models against the same aircraft maintenance questions, engineering rules, and expected answers. We are ready to test once the engineering policies are completed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Readiness Checklist Card */}
        <div className="bg-surface border border-borderMain rounded-lg p-6 lg:col-span-1 flex flex-col h-full">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" />
            Readiness Checklist
          </h2>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Engineering task categories created</p>
                <p className="text-xs text-textMuted">Taxonomy is ready</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Deduplicated questions imported</p>
                <p className="text-xs text-textMuted">Data baseline is ready</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-70">
              <CircleDashed className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Global Rules & Task Policies pending</p>
                <p className="text-xs text-textMuted">Awaiting engineering input</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-70">
              <CircleDashed className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Category rules pending</p>
                <p className="text-xs text-textMuted">Awaiting engineering input</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-50">
              <Lock className="w-5 h-5 text-textMuted mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Model comparison locked</p>
                <p className="text-xs text-textMuted">Requires completed policies</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Test Flow Preview */}
        <div className="bg-surface border border-borderMain rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Scale className="w-5 h-5 mr-2 text-emerald-400" />
            Evaluation Process
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <p className="text-sm text-textMain ml-2">Engineers fill Global Rules & Task Policies</p>
            </div>
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <p className="text-sm text-textMain ml-2">Engineers complete category-specific rules</p>
            </div>
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <p className="text-sm text-textMain ml-2">Questions are reviewed and tagged</p>
            </div>
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <p className="text-sm text-textMain ml-2">AeroMind runs each question through both models</p>
            </div>
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <p className="text-sm text-textMain ml-2">Results are compared side by side</p>
            </div>
            <div className="bg-background border border-borderMain rounded-md p-3 relative">
              <div className="absolute -left-2 -top-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">6</div>
              <p className="text-sm text-textMain ml-2">Engineers choose preferred outputs & improve policies</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Model Comparison Preview */}
      <h2 className="text-xl font-bold text-white mt-8 mb-4">Model Comparison Sandbox</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: GPT-5 */}
        <div className="bg-gradient-to-b from-indigo-500/10 to-surface border border-indigo-500/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              GPT-5 Evaluation
            </h3>
            <span className="text-xs font-medium text-textMuted bg-background px-2 py-1 rounded">Pending</span>
          </div>
          <p className="text-sm text-textMuted mb-6 h-10">
            Will test responses against AeroMind engineering policies, category rules, required sources, and expected key points.
          </p>
          
          <div className="space-y-3">
            <MetricItem label="Source grounding" />
            <MetricItem label="Rule compliance" />
            <MetricItem label="Answer structure" />
            <MetricItem label="Safety/redline adherence" />
            <MetricItem label="Engineer preference" />
          </div>
        </div>

        {/* Right Card: Claude */}
        <div className="bg-gradient-to-b from-purple-500/10 to-surface border border-purple-500/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </div>
              Claude Evaluation
            </h3>
            <span className="text-xs font-medium text-textMuted bg-background px-2 py-1 rounded">Pending</span>
          </div>
          <p className="text-sm text-textMuted mb-6 h-10">
            Will run the same questions through Claude for side-by-side engineering quality comparison.
          </p>
          
          <div className="space-y-3">
            <MetricItem label="Source grounding" />
            <MetricItem label="Rule compliance" />
            <MetricItem label="Answer structure" />
            <MetricItem label="Safety/redline adherence" />
            <MetricItem label="Engineer preference" />
          </div>
        </div>
      </div>

      {/* 5. Example Comparison Table Mockup */}
      <div className="bg-surface border border-borderMain rounded-lg overflow-hidden mt-8">
        <div className="p-4 border-b border-borderMain bg-background/50 flex justify-between items-center">
          <h3 className="text-base font-semibold text-white">Live Evaluation Results (Mockup)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surfaceHover border-b border-borderMain text-xs uppercase text-textMuted">
                <th className="p-4 font-semibold w-1/4">Question</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold w-1/5">GPT-5 Result</th>
                <th className="p-4 font-semibold w-1/5">Claude Result</th>
                <th className="p-4 font-semibold">Policy Match</th>
                <th className="p-4 font-semibold">Preferred</th>
                <th className="p-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-borderMain">
              <tr className="hover:bg-surfaceHover/50 transition-colors">
                <td className="p-4 text-white font-medium">What should I do if the helicopter is shaking?</td>
                <td className="p-4">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    Fault Diagnosis
                  </span>
                </td>
                <td className="p-4 text-textMuted italic">Pending test</td>
                <td className="p-4 text-textMuted italic">Pending test</td>
                <td className="p-4 text-amber-500 flex items-center gap-1.5 whitespace-nowrap">
                  <CircleDashed className="w-3.5 h-3.5" /> Waiting for rules
                </td>
                <td className="p-4 text-textMuted">Not selected</td>
                <td className="p-4 text-textMuted">Pending review</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Call-to-Action Card */}
      <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between mt-12 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Unlock Model Evaluation</h3>
            <p className="text-sm text-textMuted">
              To unlock model evaluation, complete the Global Rules & Task Policies and fill the category-specific engineering guidance.
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/global-rules')}
          className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center flex-shrink-0 whitespace-nowrap"
        >
          Go to Rules & Task Policies
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

function MetricItem({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center bg-background border border-borderMain rounded px-3 py-2">
      <span className="text-sm text-white">{label}</span>
      <span className="text-xs text-textMuted flex items-center gap-1.5">
        <CircleDashed className="w-3 h-3 text-amber-500" /> Pending
      </span>
    </div>
  );
}

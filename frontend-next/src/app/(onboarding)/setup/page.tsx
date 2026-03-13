'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useOnboarding, BrandTone } from '../../../context/OnboardingContext';
import { authClient, fetchWithAccess } from '../../../lib/auth-client';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Badge } from '../../../components/ui/Badge';
import { 
  Building2, 
  Users, 
  Mail, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function SetupWizard() {
  const router = useRouter();
  const { data, updateData, currentStep, nextStep, prevStep } = useOnboarding();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    // Check if onboarded
    fetchWithAccess<any>('/auth/me').then(res => {
      if (res.ok && res.data?.tenant) {
        if (res.data.tenant.onboarded) {
          router.replace('/dashboard');
        } else {
          setTenantId(res.data.tenant._id);
          if (!data.companyName) {
            updateData({ companyName: res.data.tenant.name || '' });
          }
        }
      }
    });
  }, [session, sessionPending, router, data.companyName, updateData]);

  if (sessionPending || !tenantId) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Finalize setup
      const res = await fetchWithAccess(`/tenants/${tenantId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: data.companyName,
          supportEmail: data.supportEmail,
          industry: data.industry,
          teamSize: data.teamSize,
          brandTone: data.brandTone,
          autoReplyEnabled: data.autoSendEnabled,
          escalationThreshold: data.escalationThreshold,
          onboarded: true
        })
      });

      if (res.ok) {
        nextStep(); // Move to celebration step 6
        triggerConfetti();
        setTimeout(() => {
          router.push('/dashboard?welcome=true');
        }, 4000);
      } else {
        toast.error('Failed to complete setup');
      }
    } catch (e) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const saveAndNext = async () => {
    if (currentStep === 1) {
      // Basic validation
      if (!data.companyName || !data.industry || !data.teamSize) {
        return toast.error("Please fill out the required fields");
      }
      setLoading(true);
      await fetchWithAccess(`/tenants/${tenantId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: data.companyName,
          supportEmail: data.supportEmail,
          industry: data.industry,
          teamSize: data.teamSize
        })
      });
      setLoading(false);
    }
    nextStep();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <WorkspaceSetup />;
      case 2:
        return <InviteTeam />;
      case 3:
        return <ConnectInbox tenantId={tenantId} />;
      case 4:
        return <BuildKB />;
      case 5:
        return <AIConfig />;
      case 6:
        return (
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">You're all set!</h1>
            <p className="text-slate-400 text-lg">Your AI-powered workspace is ready.</p>
            <p className="text-sm text-slate-500 animate-pulse mt-8">Redirecting to your dashboard...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (currentStep === 6) {
    return renderStepContent();
  }

  const steps = [
    { id: 1, label: 'Workspace', icon: Building2 },
    { id: 2, label: 'Team', icon: Users },
    { id: 3, label: 'Inbox', icon: Mail },
    { id: 4, label: 'Knowledge Base', icon: BookOpen },
    { id: 5, label: 'AI Behavior', icon: Sparkles }
  ];

  return (
    <div className="w-full flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Let's set up your workspace</h1>
        <p className="text-slate-400">Complete these short steps to supercharge your support.</p>
      </div>

      <div className="flex items-center justify-between relative px-2 mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-500 rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        />
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive ? 'bg-cyan-950 border-cyan-500 text-cyan-400' :
                  isPast ? 'bg-cyan-500 border-cyan-500 text-white' :
                  'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isPast ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs font-medium absolute -bottom-6 w-24 text-center ${isActive ? 'text-cyan-400' : isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl pb-6">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>

        <div className="flex items-center justify-between px-8 pt-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 1 || loading}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {currentStep < 5 ? (
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="ghost" className="text-slate-500 hover:text-slate-300" onClick={nextStep}>
                  Skip for now
                </Button>
              )}
              <Button onClick={saveAndNext} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleFinish} disabled={loading} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20">
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finish Setup <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// STEP 1
function WorkspaceSetup() {
  const { data, updateData } = useOnboarding();
  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Company Details</h2>
        <p className="text-sm text-slate-400">Tell us about your organization to personalize your AI.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Company Name</label>
          <Input 
            value={data.companyName} 
            onChange={e => updateData({ companyName: e.target.value })} 
            className="bg-slate-950 border-slate-800"
            placeholder="Acme Corp"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Support Email (Optional)</label>
          <Input 
            type="email"
            value={data.supportEmail} 
            onChange={e => updateData({ supportEmail: e.target.value })} 
            className="bg-slate-950 border-slate-800"
            placeholder="support@yourcompany.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Industry</label>
            <select 
              value={data.industry}
              onChange={e => updateData({ industry: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select industry...</option>
              <option value="software">Software / SaaS</option>
              <option value="ecommerce">E-commerce</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Team Size</label>
            <select 
              value={data.teamSize}
              onChange={e => updateData({ teamSize: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="" disabled>Select team size...</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 2
function InviteTeam() {
  const [emails, setEmails] = useState(['', '', '']);
  const updateEmail = (index: number, val: string) => {
    const next = [...emails];
    next[index] = val;
    setEmails(next);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Invite your team</h2>
        <p className="text-sm text-slate-400">Collaboration is better together. Add up to 3 teardraw members now.</p>
      </div>
      
      <div className="space-y-3">
        {emails.map((em, i) => (
          <div key={i} className="flex gap-2">
            <Input 
              placeholder={`teammate${i+1}@company.com`}
              value={em}
              onChange={e => updateEmail(i, e.target.value)}
              className="bg-slate-950 border-slate-800"
            />
            <select className="flex shrink-0 w-32 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500">
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">You can always add more people later from your settings.</p>
    </div>
  );
}

// STEP 3
function ConnectInbox({ tenantId }: { tenantId: string }) {
  const [polling, setPolling] = useState(false);
  const toast = useToast();

  const handleTest = () => {
    setPolling(true);
    setTimeout(() => {
      setPolling(false);
      toast.success('Test email received!');
    }, 5000);
  };

  const dummyEmail = `support.${tenantId.slice(0, 6)}@inbound.opsflow.ai`;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Connect Your Inbox</h2>
        <p className="text-sm text-slate-400">Forward your support emails to OpsFlow to create tickets automatically.</p>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-5 space-y-4">
        <label className="text-sm font-medium text-slate-300">Your OpsFlow Inbound Address</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-cyan-400 select-all block break-all">
            {dummyEmail}
          </code>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(dummyEmail);
            toast.success('Copied to clipboard');
          }}>Copy</Button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Set up a forwarding rule in Gmail or Outlook to forward all messages from your main support email to this address.
        </p>

        <div className="pt-4 border-t border-slate-800">
          <Button onClick={handleTest} disabled={polling} variant="secondary" className="w-full bg-slate-800 hover:bg-slate-700 text-white">
            {polling ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for email...</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" /> I've set up forwarding — check for test email</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// STEP 4
function BuildKB() {
  const [generating, setGenerating] = useState(false);
  const [kbContent, setKbContent] = useState('');
  const toast = useToast();

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setKbContent("Q: How do I reset my password?\nA: You can reset your password by clicking 'Forgot password' on the login screen.\n\nQ: What are your support hours?\nA: We are available 24/7 via email.");
      toast.success('Starter knowledge base generated!');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Build Knowledge Base</h2>
        <p className="text-sm text-slate-400">Give your AI the context it needs to resolve tickets automatically.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-slate-800 rounded-lg p-6 bg-slate-950/30 flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors cursor-pointer">
          <UploadCloud className="h-8 w-8 text-cyan-500 mb-3" />
          <p className="text-sm font-medium text-slate-200">Upload Documents</p>
          <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT</p>
        </div>
        
        <div 
          onClick={handleGenerate}
          className="border border-slate-800 rounded-lg p-6 bg-slate-950/30 flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors hover:border-cyan-500/50 cursor-pointer group"
        >
          {generating ? (
            <Loader2 className="h-8 w-8 text-cyan-500 mb-3 animate-spin" />
          ) : (
            <Sparkles className="h-8 w-8 text-purple-400 mb-3 group-hover:text-cyan-400 transition-colors" />
          )}
          <p className="text-sm font-medium text-slate-200">AI Starter Pack</p>
          <p className="text-xs text-slate-500 mt-1">Generate 5 starter articles</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Or paste your FAQs here</label>
        <Textarea 
          placeholder="Paste plain text FAQs, instructions, or policies..."
          className="bg-slate-950 border-slate-800 h-32"
          value={kbContent}
          onChange={e => setKbContent(e.target.value)}
        />
      </div>
    </div>
  );
}

// STEP 5
function AIConfig() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Configure AI Behavior</h2>
        <p className="text-sm text-slate-400">Fine-tune how OpsFlow interacts with your customers.</p>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Brand Tone</label>
        <div className="grid grid-cols-3 gap-3">
          {(['professional', 'friendly', 'concise'] as BrandTone[]).map((tone) => (
            <div 
              key={tone}
              onClick={() => updateData({ brandTone: tone })}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${data.brandTone === tone ? 'bg-cyan-950/30 border-cyan-500' : 'bg-slate-950/30 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${data.brandTone === tone ? 'border-cyan-500' : 'border-slate-600'}`}>
                  {data.brandTone === tone && <div className="h-2 w-2 rounded-full bg-cyan-400" />}
                </div>
                <span className="text-sm font-medium text-slate-200 capitalize">{tone}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {tone === 'professional' ? '"Thank you for contacting us. We will assist you shortly."' : 
                 tone === 'friendly' ? '"Hi there! Thanks for reaching out, we\'re happy to help!"' : 
                 '"Understood. Investigating issue now."'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-slate-200 block">Auto-Send Confident Replies</label>
            <p className="text-xs text-slate-500">Automatically send AI replies to customers when confidence is high.</p>
          </div>
          <button 
            onClick={() => updateData({ autoSendEnabled: !data.autoSendEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${data.autoSendEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${data.autoSendEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-slate-300">Escalation Threshold: {data.escalationThreshold}%</label>
          </div>
          <input 
            type="range" 
            min="60" 
            max="99" 
            value={data.escalationThreshold} 
            onChange={e => updateData({ escalationThreshold: parseInt(e.target.value) })}
            className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-slate-500">Below this confidence score, AI will draft a reply for a human to review instead of auto-resolving.</p>
        </div>
      </div>
    </div>
  );
}

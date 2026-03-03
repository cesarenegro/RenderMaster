import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { BackIcon, SparklesIcon, CreditCardIcon } from './icons';

interface PaymentPageProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onBack: () => void;
}

type PaymentStep = 'pricing' | 'checkout' | 'success';

const PaymentPage: React.FC<PaymentPageProps> = ({ onSelectPlan, onBack }) => {
  const [step, setStep] = useState<PaymentStep>('pricing');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: ['5 Credits / Month', 'Standard Rendering', 'Interiors & Exteriors', 'Community Support'],
      buttonText: 'Current Plan',
      isCurrent: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      features: ['Unlimited Rendering', 'Pro AI Models', 'AI Render (Image-to-Render)', 'Moodboard Generator', 'Priority Support'],
      buttonText: 'Upgrade to Pro',
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      features: ['Unlimited Everything', 'API Access', 'Custom AI Prompting', 'Account Manager', 'Whitelabel Export'],
      buttonText: 'Contact Sales',
    },
  ];

  const handlePlanClick = (planId: SubscriptionPlan) => {
    if (planId === 'free') return;
    setSelectedPlanId(planId);
    setStep('checkout');
  };

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      // Actually trigger the upgrade in App state after a delay
      setTimeout(() => {
        if (selectedPlanId) onSelectPlan(selectedPlanId);
      }, 1500);
    }, 2500);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-400 mb-8">Welcome to the {selectedPlan?.name} family. Redirecting to your workspace...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="absolute top-8 left-8">
          <button onClick={() => setStep('pricing')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <BackIcon className="w-5 h-5" />
            Back to plans
          </button>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form Side */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Cardholder Name</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Card Number</label>
                <div className="relative">
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-12" placeholder="xxxx xxxx xxxx xxxx" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Expiry Date</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="MM / YY" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CVC</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123" />
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Pay {selectedPlan?.price} Now
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              Secure 256-bit SSL Encrypted Payment
            </p>
          </div>

          {/* Summary Side */}
          <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl h-full">
            <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-slate-400">
                <span>{selectedPlan?.name} Subscription</span>
                <span className="text-white font-semibold">{selectedPlan?.price}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Platform Fee</span>
                <span className="text-white font-semibold">$0.00</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-white font-bold">Total due today</span>
                <span className="text-2xl font-bold text-white">{selectedPlan?.price}</span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">What happens next?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your account will be immediately upgraded to Pro status. You will receive an email receipt at your registered address.
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <BackIcon className="w-5 h-5" />
          Cancel
        </button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-slate-400 text-lg">Unlock the full power of AI for your architectural vision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-3xl flex flex-col ${
              plan.highlight
                ? 'bg-indigo-600 ring-4 ring-indigo-500/50 shadow-2xl shadow-indigo-600/30 -translate-y-4'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-300">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 text-sm">
                  <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanClick(plan.id as SubscriptionPlan)}
              disabled={plan.isCurrent}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.highlight
                  ? 'bg-white text-indigo-600 hover:bg-slate-100'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentPage;
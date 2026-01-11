'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { saveCalculation } from '@/lib/calculator-storage';
import { Button } from '@/components/ui/button';
import { Save, Check, AlertCircle, RefreshCw, LogIn } from 'lucide-react';

interface SaveCalculationButtonProps {
  calculatorType: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  className?: string;
}

export function SaveCalculationButton({
  calculatorType,
  inputs,
  results,
  className = '',
}: SaveCalculationButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    // If not logged in, redirect to auth page
    if (!user) {
      router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setSaveStatus('saving');
    
    try {
      await saveCalculation({
        calculator_type: calculatorType,
        inputs,
        results,
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save calculation:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className={`mt-4 pt-4 border-t ${className}`}>
      <Button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className="w-full"
        variant={saveStatus === 'saved' ? 'outline' : 'default'}
      >
        {!user && (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In to Save Calculation
          </>
        )}
        {user && saveStatus === 'saving' && (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        )}
        {user && saveStatus === 'saved' && (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved Successfully!
          </>
        )}
        {user && saveStatus === 'error' && (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Failed to Save
          </>
        )}
        {user && saveStatus === 'idle' && (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save This Calculation
          </>
        )}
      </Button>
    </div>
  );
}

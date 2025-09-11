'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
  showResend?: boolean;
}

export default function EmailVerification({ 
  email, 
  onVerified, 
  showResend = true 
}: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      
      toast.info("Email sent!!  please verify your email")
    } catch (error: any) {
      toast.error("faild to verify email" , error.response?.data?.error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to:
          </CardDescription>
          <p className="font-medium text-blue-600 mt-2">{email}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>Please click the verification link in your email to activate your account.</p>
            <p>Check your spam folder if you don't see the email.</p>
          </div>

          {showResend && (
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Email verified? You can now login</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// frontend/src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
 
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      router.push('/wallet');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }; 
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <AuthLayout 
      title="Sign in to Beam."
      subtitle="Please sign in with the your assigned login details"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          icon={<Mail className="h-5 w-5 text-gray-400" />}
        />
        
        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="h-5 w-5 text-gray-400" />}
          />
          
          <div className="flex items-center justify-between mt-1">
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="text-sm text-gray-600 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              {showPassword ? 'Hide' : 'Show'}
            </button>
            
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Log in
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    if (email.length === 0) return "Email is required";
    if (!email.includes('@')) return "Please enter a valid email address with @";
    if (!email.includes('.')) return "Please enter a valid email address with domain";
    return "";
  }

  const validatePassword = (password) => {
    if (password.length === 0) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  }

  const validateConfirmPassword = (confirmPassword, password) => {
    if (confirmPassword.length === 0) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  }

  const getErrorMessage = (error) => {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    return error.message || error.error_description || 'Unknown error';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    if (!emailErr && !passwordErr && !confirmPasswordErr) {
      try {
        // Sign up user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // If Supabase requires email confirmation, no session is returned yet.
          // The user can't insert into RLS-protected tables without a JWT, so bail out
          // and tell them to confirm their email first.
          if (!authData.session) {
            alert("Account created! Please check your email to confirm your account, then sign in.");
            router.push('/sign-in');
            return;
          }

          alert("Account created successfully!");
          // Create profile details in profile setup (handles user/profile upserts)
          router.push('/profile-setup');
        }
      } catch (error) {
        console.error('Error creating account:', error);
        const message = getErrorMessage(error);
        if (message.toLowerCase().includes('already registered')) {
          setEmailError('An account with this email already exists');
        } else {
          alert('Error creating account: ' + message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className='bg-white rounded-lg p-8 shadow-lg w-96'>
        <h2 className='font-bold text-lg mb-4'>Create your account</h2>

        <form onSubmit={handleSubmit}>
          <label className='block mb-2'>Email</label>
          <input
            disabled={isLoading}
            type="email"
            placeholder='john@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            className='border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
          />
          {emailError && <p className='text-red-500 text-sm mb-4'>{emailError}</p>}

          <label className='block mb-2'>Password</label>
          <input
            disabled={isLoading}
            type="password"
            placeholder='********'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
            className='border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
          />
          {passwordError && <p className='text-red-500 text-sm mb-4'>{passwordError}</p>}

          <label className='block mb-2'>Confirm Password</label>
          <input
            disabled={isLoading}
            type="password"
            placeholder='********'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={(e) => setConfirmPasswordError(validateConfirmPassword(e.target.value, password))}
            className='border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
          />
          {confirmPasswordError && <p className='text-red-500 text-sm mb-4'>{confirmPasswordError}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className='bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md mb-4 w-full text-black font-medium disabled:opacity-50'
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className='text-md text-gray-500 text-center'>
          Already have an account?
          <Link href='/sign-in' className='text-blue-600 ml-1 hover:underline cursor-pointer'>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

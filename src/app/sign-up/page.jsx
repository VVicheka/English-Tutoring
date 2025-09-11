"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Adjust path as needed

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateName = (name) => {
    if (name.length === 0) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return "";
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    if (!nameErr && !emailErr && !passwordErr && !confirmPasswordErr) {
      try {
        // Sign up user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name, // This will be stored in auth.users metadata
            }
          }
        });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // Insert additional user data into your custom users table
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id, // Use the same ID from auth.users
                name: name,
                email: email,
                // Don't store password - Supabase Auth handles this
                avatar_url: null,
                google_id: null
              }
            ]);

          if (insertError) {
            console.error('Error inserting user data:', insertError);
            // Note: User is created in auth but not in custom table
          }

          // Create initial user progress
          await supabase
            .from('user_progress')
            .insert([
              {
                user_id: authData.user.id,
                total_lessons_completed: 0,
                total_units_completed: 0,
                total_quizzes_completed: 0,
                total_best_score: 0
              }
            ]);

          alert("Account created successfully! Please check your email to verify your account.");
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error creating account:', error);
        if (error.message.includes('already registered')) {
          setEmailError('An account with this email already exists');
        } else {
          alert('Error creating account: ' + error.message);
        }
      }
    }
    
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className='bg-white rounded-lg p-8 shadow-lg w-96'>
        <h2 className='font-bold text-lg mb-4'>Create your account</h2>

        <form onSubmit={handleSubmit}>
          <label className='block mb-2'>Name</label>
          <input
            disabled={isLoading}
            type="text"
            placeholder='John Doe'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => setNameError(validateName(e.target.value))}
            className='border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
          />
          {nameError && <p className='text-red-500 text-sm mb-4'>{nameError}</p>}

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
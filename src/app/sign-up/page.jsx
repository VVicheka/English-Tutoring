"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SignUp() {
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
    if (name.length === 0) {
      return "Name is required";
    } else if (name.length < 2) {
      return "Name must be at least 2 characters";
    } else {
      return "";
    }
  }

  const validateEmail = (email) => {
    if (email.length === 0) {
      return "Email is required";
    } else if (!email.includes('@')) {
      return "Please enter a valid email address with @";
    } else if (!email.includes('.')) {
      return "Please enter a valid email address with domain";
    } else {
      return "";
    }
  }

  const validatePassword = (password) => {
    if (password.length === 0) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Password must be at least 8 characters";
    } else {
      return "";
    }
  }

  const validateConfirmPassword = (confirmPassword, password) => {
    if (confirmPassword.length === 0) {
      return "Please confirm your password";
    } else if (confirmPassword !== password) {
      return "Passwords do not match";
    } else {
      return "";
    }
  }

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    const error = validateName(newName);
    setNameError(error);
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const error = validateEmail(newEmail);
    setEmailError(error);
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const error = validatePassword(newPassword);
    setPasswordError(error);
  }

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    const error = validateConfirmPassword(newConfirmPassword, password);
    setConfirmPasswordError(error);
  }

  const handleSubmit = (e) => {
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
    
    if (nameErr === "" && emailErr === "" && passwordErr === "" && confirmPasswordErr === "") {
      console.log("Creating account:", { name, email, password });
      
      setTimeout(() => {
        setIsLoading(false);
        alert("Account created successfully!");
      }, 2000);
    } else {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className='flex items-center justify-center min-h-screen'>
        <div className='bg-white rounded-lg p-8 shadow-lg w-96'>
          <h2 className='font-bold text-lg mb-4'>Create your account</h2>
          
          <form onSubmit={handleSubmit}>
            <div>
              <label className='block mb-2'>Full Name</label>
              <input 
                disabled={isLoading}
                type="text" 
                placeholder='John Doe'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameChange}
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
                onBlur={handleEmailChange}
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
                onBlur={handlePasswordChange}
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
                onBlur={handleConfirmPasswordChange}
                className='border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
              />
              {confirmPasswordError && <p className='text-red-500 text-sm mb-4'>{confirmPasswordError}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className='bg-green-500 hover:bg-green-600 p-2 rounded-md mb-4 w-full text-white'
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className='text-md text-gray-500 text-center'>
            Already have an account?
            <Link href='/sign-in' className='text-blue-700 ml-1 hover:underline cursor-pointer'>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
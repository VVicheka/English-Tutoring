"use client";
import React, {useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validationEmail = (email) => {
    if (email.length === 0) {
      return "Email is required";
    } else if (!email.includes('@')){
      return "Please enter a valid email address with @";
    } else if (!email.includes('.')){
      return "Please enter a valid email address with domain";
    } else {
      return "";
    }
  }

  const validationPassword = (password) => {
    if (password.length === 0) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Minimum length of password is 8";
    } else {
      return "";
    }
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const error = validationPassword(newPassword);
    setPasswordError(error);
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    const error = validationEmail(newEmail);
    setEmailError(error);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const emailErr = validationEmail(email);
    const passwordErr = validationPassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr === "" && passwordErr === "") {
      console.log("Submitting: ", {email, password});
      // Later part send to backend

      //Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        router.push('/')
      }, 2000);
    } else {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      router.push('/');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className='flex items-center justify-center min-h-screen'>

        <div className='hidden lg:block'>
          <Image 
            src="/boy_student.png"
            alt="boy student"
            width={352}
            height={352}
          />
        </div>

        <div className='bg-white rounded-lg p-8 shadow-lg w-96'>
          <h2 className='font-bold text-lg mb-4'>Login to your account</h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label className='block mb-2'>Email</label>
              <input 
                disabled={isLoading}
                type="email" 
                placeholder='thona@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailChange}
                className='border border-black rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500 '
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
                className='border border-black rounded-md p-2 mb-4 w-full focus:outline-none focus:border-blue-500'
              />
              {passwordError && <p className='text-red-500 text-sm mb-4'>{passwordError}</p>}

            </div>

            <button type="submit" className='bg-amber-400 hover:bg-amber-500 p-2 rounded-md mb-4 w-full'>
              {isLoading ? 'Logging in...' : 'Login Now'}
            </button>
          </form>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className='bg-amber-200 hover:bg-amber-500 p-2 rounded-md mb-4 w-full'>
            {isGoogleLoading ? 'Loading...' : 'Continue with Google'}
          </button>

          <div className='text-md text-gray-500'>
            Don&apos;t have an account?
            <Link href='/sign-up' className='text-blue-700 ml-1 hover:underline cursor-pointer'>
              Sign up
            </Link>
          </div>
        </div>

        <div className='hidden lg:block'>
          <Image 
            src="/boy_student.png"
            alt="girl student"
            width={352}
            height={352}
          />
        </div>

      </div>

      <div className='absolute bottom-0 w-full flex justify-center'>
        <Image 
          src="/boy_student.png"
          alt='cheering student'
          width={100}
          height={100}
        />
      </div>

    </div>
  )
}

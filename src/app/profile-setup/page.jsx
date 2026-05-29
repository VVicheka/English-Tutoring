'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function ProfileSetup() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({name: '', avatar: ''});
    const avatars = ['/image1.svg', '/image2.svg', '/image3.svg', '/image4.svg', '/image5.svg', '/image6.svg', '/image7.svg', '/image8.svg', '/image9.svg', '/image10.svg', '/image11.svg', '/image12.svg'];
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const avatarsPerPage = 6;
    const totalPages = Math.ceil(avatars.length / avatarsPerPage);
    const startIndex = currentPage * avatarsPerPage;
    const currentAvatars = avatars.slice(startIndex, startIndex + avatarsPerPage);

    const handleSubmit = async () => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) {
                newErrors.name = 'Please enter your name';
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (!formData.avatar) {
                setErrors({avatar: "Please choose an avatar"});
                return;
            }
            
            setIsLoading(true);
            
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    throw new Error('No authenticated user found');
                }

                // Upsert so this works for first-time Google OAuth users and
                // email-confirmation sign-ups (their `users` row may not exist yet)
                const { error } = await supabase
                    .from('users')
                    .upsert(
                        {
                            id: user.id,
                            name: formData.name.trim(),
                            email: user.email,
                            avatar_url: formData.avatar
                        },
                        { onConflict: 'id' }
                    );

                if (error) {
                    throw error;
                }

                // Ensure a user_progress row exists (no-op if already present)
                await supabase
                    .from('user_progress')
                    .upsert(
                        {
                            user_id: user.id,
                            total_lessons_completed: 0,
                            total_units_completed: 0,
                            total_quizzes_completed: 0,
                            total_best_score: 0
                        },
                        { onConflict: 'user_id', ignoreDuplicates: true }
                    );

                console.log("Profile setup complete:", formData);
                router.push('/');
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Error setting up profile: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className='min-h-screen bg-blue-200 flex justify-center items-center'>
            {currentStep === 1 && (
                <div className='max-w-lg w-full bg-white rounded-2xl p-8 flex flex-col items-center'>
                    <h1 className='text-2xl font-semibold mb-6 text-center'>What is your name?</h1>
                    <div className='w-full flex flex-col items-center'>
                        <input 
                            type="text" 
                            placeholder='Enter your name'
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className='bg-gray-100 rounded-md p-3 mb-2 w-full text-center focus:outline-none focus:bg-gray-200'
                        />
                        {errors.name && <p className='text-red-500 text-sm mb-6'>{errors.name}</p>}
                    </div>

                    <button
                        onClick={handleSubmit} 
                        className='bg-amber-400 text-white px-8 py-3 rounded-lg font-semibold mt-8'>
                        Next &gt;
                    </button>
                </div>
            )}

            {currentStep === 2 && (
                <div className='max-w-lg w-full bg-white rounded-2xl p-8 flex flex-col'>
                    {/* Header with Back button */}
                    <div className='flex items-center justify-between mb-8'>
                        <button
                            onClick={() => setCurrentStep(1)}
                            disabled={isLoading}
                            className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-50'
                        >
                            Back
                        </button>
                        <h1 className='text-2xl font-semibold text-center flex-1'>Select an avatar</h1>
                        <div className='w-16'></div> {/* Spacer for balance */}
                    </div>

                    {/* Avatar selection with side pagination */}
                    <div className='flex items-center justify-center mb-6'>
                        {/* Left arrow */}
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 0 || isLoading}
                            className='text-gray-500 disabled:text-gray-300 text-3xl mr-6'
                        >
                            &lt;
                        </button>

                        {/* Avatar grid */}
                        <div className='grid grid-cols-3 gap-10'>
                            {currentAvatars.map((avatar, index) => (
                                <div 
                                    key={startIndex + index}
                                    onClick={() => !isLoading && setFormData({...formData, avatar: avatar})}
                                    className={`w-16 h-16 rounded-full flex justify-center items-center cursor-pointer transition-all
                                    ${formData.avatar === avatar ? 'bg-amber-400' : 'bg-amber-100'}
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Image
                                        src={avatar}
                                        alt={`Avatar ${startIndex + index + 1}`}
                                        width={48}
                                        height={48}
                                        className='object-contain'
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Right arrow */}
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages - 1 || isLoading}
                            className='text-gray-500 disabled:text-gray-300 text-3xl ml-6'
                        >
                            &gt;
                        </button>
                    </div>

                    {errors.avatar && <p className='text-red-500 text-sm mb-4 text-center'>{errors.avatar}</p>}

                    <div className='flex justify-center'>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className='bg-amber-400 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50'
                        >
                            {isLoading ? 'Setting up...' : 'Finish'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
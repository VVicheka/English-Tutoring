'use client';
import React, {useState} from 'react'

export default function ProfileSetup() {

    const [formData, setFormData] = useState({name: '', age: ''});
    const ages = ['3', '4', '5', '6', '7', '8+'];
    const handleSubmit = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Please enter your name';
        }

        if (!formData.age) {
            newErrors.age = 'Please select your age';
        }

        setError(newErrors);
        if (Object.keys(newErrors).length === 0) {
            console.log('Form Data:', formData);
        }
    }

    return (
        <div className='min-h-screen bg-blue-200 flex justify-center items-center'>
            <div className='max-w-lg w-full bg-white rounded-2xl p-8 flex flex-col'>
                <h1 className='text-2xl font-semibold mb-4'>What is your name?</h1>
                <div>
                    <input 
                        type="text" 
                        placeholder='Enter your name'
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className='border border-gray-300 rounded-md p-3 mb-8 w-full focus:outline-none focus:border-blue-500 text-center'
                    />
                </div>

                <h1 className=' text-2xl font-semibold mb-4'>Select your age</h1>
                <div className='flex flex-row gap-3 w-full text-lg'>
                    {ages.map((age) => (
                        <div
                            key={age}
                            onClick={() => setFormData({...formData, age: age})}
                            className={`w-14 h-14 rounded-full border-2 flex justify-center items-center cursor-pointer
                            ${formData.age === age ? 'bg-amber-400 border-amber-400' : 'border-amber-400'}`}
                        >
                            <h1>{age}</h1>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit} 
                    className='mt-8 bg-amber-400 text-white px-8 py-3 rounded-lg font-semibold'>
                    Next &gt;
                </button>
            </div>
        </div>
    )
}

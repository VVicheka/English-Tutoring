"use client";
import React, { useState, useEffect } from 'react';

// Updated curriculum data - exact sequence: 1,2,3,4,Quiz1,5,6,7,8,Quiz2,9,10,11,12,Quiz3,Reward
const curriculumData = [
  // Lessons 1-4
  {
    id: 1,
    type: "lesson",
    title: "Lesson 1",
    focus: "Jungle Animals - Short a",
    position: { bottom: "3%", right: "30%" },
    completed: true,
    stars: 2,
    score: 75,
    unlocked: true
  },
  {
    id: 2,
    type: "lesson", 
    title: "Lesson 2",
    focus: "Farm Friends - Short e",
    position: { bottom: "6%", right: "48%" },
    completed: true,
    stars: 3,
    score: 95,
    unlocked: true
  },
  {
    id: 3,
    type: "lesson",
    title: "Lesson 3",
    focus: "Zoo Day - Short i",
    position: { bottom: "9%", left: "73%" },
    completed: false,
    stars: 0,
    unlocked: true
  },
  {
    id: 4,
    type: "lesson",
    title: "Lesson 4",
    focus: "Animal Fun Review",
    position: { bottom: "12%", right: "38%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  
  // Quiz 1
  {
    id: "quiz1",
    type: "quiz",
    title: "Quiz 1",
    focus: "Unit 1 Checkpoint",
    position: { bottom: "6%", left: "34%" },
    completed: false,
    stars: 0,
    unlocked: false
  },

  // Lessons 5-8
  {
    id: 5,
    type: "lesson",
    title: "Lesson 5",
    focus: "Forest Fun - Short o",
    position: { bottom: "6%", left: "16%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 6,
    type: "lesson",
    title: "Lesson 6",
    focus: "Muddy Fun - Short u",
    position: { bottom: "14%", right: "59%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 7,
    type: "lesson",
    title: "Lesson 7",
    focus: "Rainy Day - Blends",
    position: { bottom: "20%", left: "50%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 8,
    type: "lesson",
    title: "Lesson 8",
    focus: "Unit 2 Review",
    position: { bottom: "20%", right: "15%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  
  // Quiz 2
  {
    id: "quiz2",
    type: "quiz",
    title: "Quiz 2",
    focus: "Unit 2 Checkpoint",
    position: { bottom: "25%", left: "88%" },
    completed: false,
    stars: 0,
    unlocked: false
  },

  // Lessons 9-12
  {
    id: 9,
    type: "lesson",
    title: "Lesson 9",
    focus: "Windy Walk - Review",
    position: { bottom: "30%", left: "87%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 10,
    type: "lesson",
    title: "Lesson 10",
    focus: "Sunny Streets - Long a",
    position: { bottom: "30%", right: "32%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 11,
    type: "lesson",
    title: "Lesson 11",
    focus: "Home Helpers - Long i",
    position: { bottom: "24%", left: "40%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 12,
    type: "lesson",
    title: "Lesson 12",
    focus: "Final Review",
    position: { bottom: "32%", right: "62%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  
  // Quiz 3
  {
    id: "quiz3",
    type: "quiz",
    title: "Quiz 3",
    focus: "Unit 3 Checkpoint",
    position: { bottom: "35%", left: "48%" },
    completed: false,
    stars: 0,
    unlocked: false
  },
  
  // Final Reward
  {
    id: "reward",
    type: "reward",
    title: "🏆 Reward!",
    focus: "Congratulations!",
    position: { bottom: "40%", left: "48%" },
    completed: false,
    stars: 0,
    unlocked: false
  }
];

// Fixed Navigation Buttons Component (moved up with lighter colors)
const NavigationButtons = () => {
  return (
    <div className="fixed left-4 top-20 z-50 flex flex-col gap-3">
      {/* Profile Button */}
      <button 
        className="w-12 h-12 bg-blue-300 hover:bg-blue-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Profile clicked')}
      >
        <span className="text-lg">👤</span>
      </button>
      
      {/* Progress Button */}
      <button 
        className="w-12 h-12 bg-green-300 hover:bg-green-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Progress clicked')}
      >
        <span className="text-lg">📊</span>
      </button>
      
      {/* Details Button */}
      <button 
        className="w-12 h-12 bg-purple-300 hover:bg-purple-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Details clicked')}
      >
        <span className="text-lg">📋</span>
      </button>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ stars, maxStars = 3 }) => {
  return (
    <div className='flex justify-center gap-1 mb-2'>
      {[...Array(maxStars)].map((_, index) => (
        <span key={index} className="text-sm">
          {index < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
};

// Roadmap Node Component (with quiz and reward support)
const RoadmapNode = ({ item, onClick }) => {
  const getNodeStyle = () => {
    if (item.type === "reward") {
      if (!item.unlocked) return "bg-yellow-300 cursor-not-allowed opacity-60";
      if (item.completed) return "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-300 animate-pulse"; 
      return "bg-yellow-400 hover:bg-yellow-500 shadow-yellow-300";
    }
    if (item.type === "quiz") {
      if (!item.unlocked) return "bg-orange-300 cursor-not-allowed opacity-60";
      if (item.completed) return "bg-orange-500 hover:bg-orange-600 shadow-orange-300"; 
      return "bg-orange-400 hover:bg-orange-500 shadow-orange-300";
    }
    if (item.type === "lesson") {
      if (!item.unlocked) return "bg-gray-400 cursor-not-allowed opacity-60";
      if (item.completed) return "bg-green-500 hover:bg-green-600 shadow-green-300"; 
      return "bg-blue-500 hover:bg-blue-600 shadow-blue-300";
    }
    return "bg-gray-400";
  };

  const getNodeContent = () => {
    if (item.type === "reward") return "🏆";
    if (item.type === "quiz") return "📝";
    if (item.type === "lesson") return item.id;
    return "?";
  };

  const isClickable = item.unlocked || item.completed;

  return (
    <div 
      className={`absolute text-center transform transition-all duration-300 ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
      style={{
        bottom: item.position.bottom,
        left: item.position.left,
        right: item.position.right,
        zIndex: 10,
        transform: 'translate(-50%, 50%)'
      }}
      onClick={isClickable ? () => onClick(item) : undefined}
    >
      {/* Stars above completed items */}
      {item.completed && item.stars > 0 && (
        <StarRating stars={item.stars} />
      )}
      
      {/* Node Circle - lesson number, quiz icon, or reward */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center 
        text-white font-bold text-lg shadow-lg border-2 border-white
        ${getNodeStyle()}
      `}>
        {getNodeContent()}
      </div>
    </div>
  );
};

// Main Component
export default function HomePage() {
  const [curriculum, setCurriculum] = useState(curriculumData);

  // Scroll to bottom on page load
  React.useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  return (
    <div className='min-h-screen bg-sky-100'>
      {/* Fixed Navigation Buttons */}
      <NavigationButtons />
      
      {/* Scrollable Roadmap with Your Background - No Header */}
      <div 
        className='relative w-full bg-cover bg-bottom bg-no-repeat'
        style={{
          backgroundImage: 'url("/roadmap.svg")', // Your SVG background image
          minHeight: '300vh', // Make it very tall for scrolling
          backgroundSize: 'contain', // Keep full image visible
          backgroundRepeat: 'no-repeat'
        }}
              >
          {/* Lessons positioned on the road */}
          {curriculum.map((item) => (
            <RoadmapNode 
              key={item.id}
              item={item}
              onClick={(clickedItem) => {
                console.log('Clicked:', clickedItem.title);
                // Add navigation to lesson pages here
              }}
            />
          ))}
        </div>
    </div>
  );
}
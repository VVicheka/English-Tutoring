"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Curriculum data with SVG coordinates (800x1200 viewBox)
const curriculumData = [
  {
    id: "get-started",
    type: "start",
    title: "Get Started",
    focus: "Sign up to begin",
    svgPosition: { x: 660, y: 1140 },
    completed: false,
    stars: 0,
    unlocked: true // Always accessible for new users
  },
  {
    id: 1,
    type: "lesson",
    title: "Lesson 1",
    focus: "Jungle Animals - Short a",
    svgPosition: { x:490, y: 1100 }, // Bottom right
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
    svgPosition: { x: 352, y: 1050 }, // Moving up
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
    svgPosition: { x: 480, y: 960 }, // Left curve
    completed: true,
    stars: 3,
    score: 75,
    unlocked: true
  },
  {
    id: 4,
    type: "lesson",
    title: "Lesson 4",
    focus: "Animal Fun Review",
    svgPosition: { x: 600, y: 870 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "quiz1",
    type: "quiz",
    title: "Quiz 1",
    focus: "Unit 1 Checkpoint",
    svgPosition: { x: 710, y: 750 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 5,
    type: "lesson",
    title: "Lesson 5",
    focus: "Forest Fun - Short o",
    svgPosition: { x: 550, y: 700 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 6,
    type: "lesson",
    title: "Lesson 6",
    focus: "Muddy Fun - Short u",
    svgPosition: { x: 410, y: 870 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 7,
    type: "lesson",
    title: "Lesson 7",
    focus: "Rainy Day - Blends",
    svgPosition: { x: 260, y: 1020 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 8,
    type: "lesson",
    title: "Lesson 8",
    focus: "Unit 2 Review",
    svgPosition: { x: 140, y: 850 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "quiz2",
    type: "quiz",
    title: "Quiz 2",
    focus: "Unit 2 Checkpoint",
    svgPosition: { x: 310, y: 650 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 9,
    type: "lesson",
    title: "Lesson 9",
    focus: "Windy Walk - Review",
    svgPosition: { x: 650, y: 600 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 10,
    type: "lesson",
    title: "Lesson 10",
    focus: "Sunny Streets - Long a",
    svgPosition: { x: 680, y: 320 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 11,
    type: "lesson",
    title: "Lesson 11",
    focus: "Home Helpers - Long i",
    svgPosition: { x: 440, y: 460 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 12,
    type: "lesson",
    title: "Lesson 12",
    focus: "Final Review",
    svgPosition: { x: 240, y: 340 },
    completed: false,
    stars: 0,
    unlocked: false
  },

  {
    id: "reward",
    type: "reward",
    title: "🏆 Reward!",
    focus: "Congratulations!",
    svgPosition: { x: 385, y: 90 },
    completed: false,
    stars: 0,
    unlocked: false
  }
];

// Fixed Navigation Buttons Component
const NavigationButtons = () => {
  return (
    <div className="fixed left-32 top-16 z-50 flex flex-col gap-6">
      {/* Profile Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button 
          className="w-14 h-14 bg-blue-300 hover:bg-blue-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => console.log('Profile clicked')}
        >
          <span className="text-lg">👤</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Name</span>
      </div>
      
      {/* Progress Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button 
          className="w-14 h-14 bg-green-300 hover:bg-green-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => console.log('Progress clicked')}
        >
          <span className="text-lg">📊</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Progress</span>
      </div>
      
      {/* Details Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button 
          className="w-14 h-14 bg-purple-300 hover:bg-purple-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => console.log('Details clicked')}
        >
          <span className="text-lg">📋</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Details</span>
      </div>
    </div>
  );
};

// True SVG-based roadmap component - 70% width and no bottom space
const SVGRoadmap = ({ curriculum, onClick }) => {
  const getNodeColor = (item) => {
    if (item.type === "start") {
      return "#22C55E"; // Green color for get started
    }
    if (item.type === "reward") {
      if (!item.unlocked) return "#FCD34D";
      return "#F59E0B";
    }
    if (item.type === "quiz") {
      if (!item.unlocked) return "#FDBA74";
      return "#F97316";
    }
    if (item.type === "lesson") {
      if (!item.unlocked) return "#9CA3AF";
      if (item.completed) return "#10B981";
      return "#3B82F6";
    }
    return "#9CA3AF";
  };

  return (
    <div className="flex justify-center">
      <svg 
        viewBox="0 0 800 1175" 
        style={{ 
          width: '70vw',        // 70% of screen width
          height: 'auto',       // Auto height
          display: 'block'      // Remove any extra space
        }}
      >
        {/* Background roadmap image */}
        <image 
          href="/roadmap.svg" 
          x="0" 
          y="0" 
          width="800" 
          height="1175"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {/* Lesson nodes positioned with exact SVG coordinates */}
        {curriculum.map((item) => {
          const { x, y } = item.svgPosition;
          const isClickable = item.unlocked || item.completed;
          
          return (
            <g key={item.id}>
              {/* Stars above completed items */}
              {item.completed && item.stars > 0 && (
                <g>
                  {[...Array(item.stars)].map((_, index) => (
                    <text
                      key={index}
                      x={x - 12 + (index * 8)}
                      y={y - 22}
                      fontSize="12"
                      fill="#FFD700"
                      textAnchor="middle"
                    >
                      ⭐
                    </text>
                  ))}
                </g>
              )}
              
              {/* Main lesson circle or start button rectangle */}
              {item.type === "start" ? (
                // Rectangle for start button
                <rect
                  x={x - 50}          // x position (center - half width)
                  y={y - 18}          // y position (center - half height)
                  width="100"         // Button width
                  height="36"         // Button height
                  rx="18"             // Corner radius for rounded corners
                  ry="18"             // Corner radius for rounded corners
                  fill={getNodeColor(item)}
                  stroke="white"
                  strokeWidth="3"
                  className={`${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all duration-200`}
                  style={{ 
                    opacity: isClickable ? 1 : 0.6,
                    filter: isClickable ? 'none' : 'grayscale(0.5)'
                  }}
                  onClick={isClickable ? () => onClick(item) : undefined}
                />
              ) : (
                // Circle for all other items (lessons, quizzes, rewards)
                <circle
                  cx={x}
                  cy={y}
                  r="22"
                  fill={getNodeColor(item)}
                  stroke="white"
                  strokeWidth="3"
                  className={`${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all duration-200`}
                  style={{ 
                    opacity: isClickable ? 1 : 0.6,
                    filter: isClickable ? 'none' : 'grayscale(0.5)'
                  }}
                  onClick={isClickable ? () => onClick(item) : undefined}
                />
              )}
              
              {/* Lesson number or icon */}
              <text
                x={x}
                y={y + 1}
                fontSize={item.type === "start" ? "13" : "16"}  // Smaller font for start button
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                onClick={isClickable ? () => onClick(item) : undefined}
              >
                {item.type === "start" ? "Get Started" :  // Clean text without emoji
                 item.type === "reward" ? "🏆" : 
                 item.type === "quiz" ? "📝" : 
                 item.id}
              </text>
              
              {/* Hover effect circle or rectangle */}
              {isClickable && (
                item.type === "start" ? (
                  <rect
                    x={x - 50}
                    y={y - 18}
                    width="100"
                    height="36"
                    rx="18"
                    ry="18"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="3"
                    className="hover:stroke-yellow-300 hover:stroke-4 transition-all duration-200 cursor-pointer"
                    onClick={() => onClick(item)}
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r="22"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="3"
                    className="hover:stroke-yellow-300 hover:stroke-4 transition-all duration-200 cursor-pointer"
                    onClick={() => onClick(item)}
                  />
                )
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Main Component
export default function HomePage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState(curriculumData);

  // Scroll to bottom on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='min-h-screen bg-sky-100'>
      {/* Fixed Navigation Buttons */}
      <NavigationButtons />
      
    // In your HomePage component, update the onClick handler:

    <SVGRoadmap 
      curriculum={curriculum}
      onClick={(clickedItem) => {
        if (clickedItem.type === "start") {        
          router.push('/sign-up');
          return;                                  
        }
        
        if (clickedItem.type === "lesson") {
          // Check if lesson is unlocked
          if (clickedItem.unlocked || clickedItem.completed) {
            router.push(`/lesson/${clickedItem.id}`);
          } else {
            // Show locked lesson message
            alert('Complete previous lessons to unlock this one!');
          }
          return;
        }
        
        if (clickedItem.type === "quiz") {
          // Handle checkpoint quizzes
          if (clickedItem.unlocked || clickedItem.completed) {
            router.push(`/lesson/${clickedItem.id}`);
          } else {
            alert('Complete the unit lessons to unlock this quiz!');
          }
          return;
        }
        
        console.log('Clicked:', clickedItem.title);
      }}
    />
    </div>
  );
}
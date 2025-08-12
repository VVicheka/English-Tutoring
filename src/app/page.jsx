"use client";
import React, { useState, useEffect } from 'react';

// Curriculum data with SVG coordinates (800x1200 viewBox)
const curriculumData = [
  {
    id: 1,
    type: "lesson",
    title: "Lesson 1",
    focus: "Jungle Animals - Short a",
    svgPosition: { x: 352, y: 1050 }, // Bottom right
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
    svgPosition: { x: 500, y: 1080 }, // Moving up
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
    svgPosition: { x: 200, y: 1050 }, // Left curve
    completed: false,
    stars: 0,
    unlocked: true
  },
  {
    id: 4,
    type: "lesson",
    title: "Lesson 4",
    focus: "Animal Fun Review",
    svgPosition: { x: 450, y: 1000 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "quiz1",
    type: "quiz",
    title: "Quiz 1",
    focus: "Unit 1 Checkpoint",
    svgPosition: { x: 300, y: 950 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 5,
    type: "lesson",
    title: "Lesson 5",
    focus: "Forest Fun - Short o",
    svgPosition: { x: 150, y: 900 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 6,
    type: "lesson",
    title: "Lesson 6",
    focus: "Muddy Fun - Short u",
    svgPosition: { x: 550, y: 850 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 7,
    type: "lesson",
    title: "Lesson 7",
    focus: "Rainy Day - Blends",
    svgPosition: { x: 350, y: 800 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 8,
    type: "lesson",
    title: "Lesson 8",
    focus: "Unit 2 Review",
    svgPosition: { x: 600, y: 750 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "quiz2",
    type: "quiz",
    title: "Quiz 2",
    focus: "Unit 2 Checkpoint",
    svgPosition: { x: 100, y: 700 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 9,
    type: "lesson",
    title: "Lesson 9",
    focus: "Windy Walk - Review",
    svgPosition: { x: 650, y: 650 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 10,
    type: "lesson",
    title: "Lesson 10",
    focus: "Sunny Streets - Long a",
    svgPosition: { x: 250, y: 600 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 11,
    type: "lesson",
    title: "Lesson 11",
    focus: "Home Helpers - Long i",
    svgPosition: { x: 450, y: 550 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: 12,
    type: "lesson",
    title: "Lesson 12",
    focus: "Final Review",
    svgPosition: { x: 200, y: 500 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "quiz3",
    type: "quiz",
    title: "Quiz 3",
    focus: "Unit 3 Checkpoint",
    svgPosition: { x: 500, y: 450 },
    completed: false,
    stars: 0,
    unlocked: false
  },
  {
    id: "reward",
    type: "reward",
    title: "🏆 Reward!",
    focus: "Congratulations!",
    svgPosition: { x: 400, y: 350 },
    completed: false,
    stars: 0,
    unlocked: false
  }
];

// Fixed Navigation Buttons Component
const NavigationButtons = () => {
  return (
    <div className="fixed left-4 top-20 z-50 flex flex-col gap-3">
      <button 
        className="w-12 h-12 bg-blue-300 hover:bg-blue-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Profile clicked')}
      >
        <span className="text-lg">👤</span>
      </button>
      
      <button 
        className="w-12 h-12 bg-green-300 hover:bg-green-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Progress clicked')}
      >
        <span className="text-lg">📊</span>
      </button>
      
      <button 
        className="w-12 h-12 bg-purple-300 hover:bg-purple-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
        onClick={() => console.log('Details clicked')}
      >
        <span className="text-lg">📋</span>
      </button>
    </div>
  );
};

// True SVG-based roadmap component - 70% width and no bottom space
const SVGRoadmap = ({ curriculum, onClick }) => {
  const getNodeColor = (item) => {
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
              
              {/* Main lesson circle */}
              <circle
                cx={x}
                cy={y}
                r="20"
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
              
              {/* Lesson number or icon */}
              <text
                x={x}
                y={y + 1}
                fontSize="16"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                onClick={isClickable ? () => onClick(item) : undefined}
              >
                {item.type === "reward" ? "🏆" : item.type === "quiz" ? "📝" : item.id}
              </text>
              
              {/* Hover effect circle */}
              {isClickable && (
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="3"
                  className="hover:stroke-yellow-300 hover:stroke-4 transition-all duration-200 cursor-pointer"
                  onClick={() => onClick(item)}
                />
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
      
      {/* SVG Roadmap - No extra containers */}
      <SVGRoadmap 
        curriculum={curriculum}
        onClick={(clickedItem) => {
          console.log('Clicked:', clickedItem.title);
          // Add navigation to lesson pages here
        }}
      />
    </div>
  );
}
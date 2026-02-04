// /app/data/lessons.js
export const lessonData = {
  1: {
    id: 1,
    title: "Jungle Animals - Short a Words",
    focus: "Jungle Animals - Short a",
    unit: 1,
    unitTitle: "Animal Fun",
    objective: "I can read short a words and name animals.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Clap, tap, snap! Let's find a cat in a cap!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "cat", emoji: "🐱", image: "cat sitting", instruction: "Tap each sound: c-a-t." },
          { word: "bat", emoji: "🦇", image: "bat flying", instruction: "Say it slow, then fast." },
          { word: "map", emoji: "🗺️", image: "treasure map", instruction: "Trace the letters with your finger." },
          { word: "hat", emoji: "🎩", image: "big top hat", instruction: "Spell it out loud: H-A-T." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "A cat sat on a hat.", "A bat flew past the cat.", "The cat saw a map.",
          "The map was under the mat.", "The bat had the map.", "The hat fell on the bat."
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "cat", emoji: "🐱" }, { word: "bat", emoji: "🦇" },
            { word: "map", emoji: "🗺️" }, { word: "hat", emoji: "🎩" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is black.", answer: "cat" },
            { sentence: "She wears a red ____.", answer: "hat" },
            { sentence: "I see a ____.", answer: "bat" },
            { sentence: "The ____ is on the table.", answer: "map" },
            { sentence: "The bat is on the ____.", answer: "mat" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, 
          { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, 
          { name: "Milo the Monkey", emoji: "🐒" }, 
          { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Found the map", "Sat on the hat", "Flew with the bat", "Played with the cat", "Slept on the mat"],
        answers: {
          "Ellie the Elephant": "Sat on the hat",
          "Benny the Bear": "Slept on the mat", 
          "Lila the Lion": "Found the map",
          "Milo the Monkey": "Played with the cat",
          "Tina the Tiger": "Flew with the bat"
        }
      }
    }
  },

  2: {
    id: 2,
    title: "Farm Friends - Short e Words",
    focus: "Farm Friends - Short e",
    unit: 1,
    unitTitle: "Animal Fun",
    objective: "I can read short e words and talk about animals.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Ten red hens went to bed. Said one, 'Let's peck!'",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "hen", emoji: "🐔", image: "brown hen", instruction: "Tap the sounds with your finger: h-e-n." },
          { word: "pen", emoji: "🖊️", image: "blue pen", instruction: "Say each sound aloud: p-e-n." },
          { word: "bed", emoji: "🛏️", image: "cozy bed", instruction: "Stretch the word like a rubber band: b-e-d." },
          { word: "net", emoji: "🥅", image: "net for catching", instruction: "Whisper and shout the word." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "The hen ran to the bed.", "She saw a net on the pen.", "The pen was near the red bed.",
          "She slept in the pen.", "The net was on the bed.", "The hen did not get up."
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "hen", emoji: "🐔" }, { word: "pen", emoji: "🖊️" },
            { word: "bed", emoji: "🛏️" }, { word: "net", emoji: "🥅" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is soft.", answer: "bed" },
            { sentence: "She caught a bug in the ____.", answer: "net" },
            { sentence: "I write with a ____.", answer: "pen" },
            { sentence: "A red ____ is in the yard.", answer: "hen" },
            { sentence: "The pen is by the ____.", answer: "bed" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Slept in the bed", "Wrote with a pen", "Pecked like a hen", "Got caught in a net", "Sat near the red bed"],
        answers: {
          "Ellie the Elephant": "Got caught in a net",
          "Benny the Bear": "Wrote with a pen", 
          "Lila the Lion": "Pecked like a hen",
          "Milo the Monkey": "Slept in the bed",
          "Tina the Tiger": "Sat near the red bed"
        }
      }
    }
  },

  3: {
    id: 3,
    title: "Zoo Day - Short i Words",
    focus: "Zoo Day - Short i",
    unit: 1,
    unitTitle: "Animal Fun",
    objective: "I can read short i words and tell what I see.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Zip, zip, zip! I hop and skip!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "pig", emoji: "🐷", image: "smiling pig", instruction: "Say the sounds as you clap: p-i-g." },
          { word: "lid", emoji: "🧢", image: "blue lid", instruction: "Tap each letter sound: l-i-d." },
          { word: "fig", emoji: "🍈", image: "green fig fruit", instruction: "Whisper the word, then say it loud." },
          { word: "bin", emoji: "🗑️", image: "small trash bin", instruction: "Say the word and point to the picture." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "A pig sat in a bin.", "A fig fell off the lid.", "The pig saw the fig.",
          "It ran and got the fig.", "The bin had a red lid.", "The fig was big!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "pig", emoji: "🐷" }, { word: "lid", emoji: "🧢" },
            { word: "fig", emoji: "🍈" }, { word: "bin", emoji: "🗑️" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is full of trash.", answer: "bin" },
            { sentence: "The ____ is round and green.", answer: "fig" },
            { sentence: "The ____ is on the jar.", answer: "lid" },
            { sentence: "The ____ is pink and fat.", answer: "pig" },
            { sentence: "The fig fell in the ____.", answer: "bin" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Dropped the fig", "Sat in a bin", "Wore a lid on the head", "Ran after the pig", "Found a fig on the lid"],
        answers: {
          "Ellie the Elephant": "Found a fig on the lid",
          "Benny the Bear": "Wore a lid on the head", 
          "Lila the Lion": "Sat in a bin",
          "Milo the Monkey": "Ran after the pig",
          "Tina the Tiger": "Dropped the fig"
        }
      }
    }
  },

  4: {
    id: 4,
    title: "Animal Fun Review - Short Vowels a, e, i",
    focus: "Animal Fun Review",
    unit: 1,
    unitTitle: "Animal Fun",
    objective: "I can read all the words and tell short stories.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Cats and pigs, hens and hats—Let's read this and clap!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "cat", emoji: "🐱", image: "cat face", instruction: "Say the sounds slowly: c-a-t." },
          { word: "bed", emoji: "🛏️", image: "cozy bed", instruction: "Clap for each sound: b-e-d." },
          { word: "fig", emoji: "🍈", image: "fig fruit", instruction: "Point and say: f-i-g." },
          { word: "pen", emoji: "🖊️", image: "pen tip", instruction: "Whisper, then speak loud." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "The cat naps on a red bed.", "A fig drops near the pen.", "The cat rolls and hits the fig.",
          "It bounces off the lid.", "She draws the fig with a pen.", "It's a silly fig-cat!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "cat", emoji: "🐱" }, { word: "bed", emoji: "🛏️" },
            { word: "fig", emoji: "🍈" }, { word: "pen", emoji: "🖊️" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "I sleep in a ____.", answer: "bed" },
            { sentence: "The ____ meowed at the fig.", answer: "cat" },
            { sentence: "She used a blue ____.", answer: "pen" },
            { sentence: "I picked a green ____.", answer: "fig" },
            { sentence: "The pen is on the ____.", answer: "bed" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Napped on the bed", "Wrote with the pen", "Played with the cat", "Ate a fig", "Drew the fig-cat"],
        answers: {
          "Ellie the Elephant": "Napped on the bed",
          "Benny the Bear": "Ate a fig", 
          "Lila the Lion": "Played with the cat",
          "Milo the Monkey": "Wrote with the pen",
          "Tina the Tiger": "Drew the fig-cat"
        }
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Cat, bed, fig, and pen, Read the words again and again!",
        instruction: "Say the chant to someone at home.",
        homework: "Draw a silly story using all the review words."
      }
    }
  },

  // CHECKPOINT QUIZ 1
  "quiz1": {
    id: "quiz1",
    title: "Unit 1 Checkpoint Quiz",
    focus: "Unit 1 Checkpoint",
    unit: 1,
    unitTitle: "Animal Fun",
    type: "checkpoint",
    objective: "I can remember and use words from Lessons 1 to 4.",
    activities: ['quiz'],
    
    content: {
      quiz: {
        title: "Checkpoint Quiz - Unit 1",
        type: "multiple-choice",
        instruction: "Read each question and choose your answer.",
        questions: [
          {
            question: "Which word rhymes with 'hat'?",
            options: ["map", "bed", "bat"],
            answer: "bat",
            correctIndex: 2
          },
          {
            question: "What do you sleep on?",
            options: ["fig", "rug", "bed"],
            answer: "bed",
            correctIndex: 2
          },
          {
            question: "What flies in the sky?",
            options: ["bat", "bin", "pen"],
            answer: "bat",
            correctIndex: 0
          },
          {
            question: "What is round and green?",
            options: ["fig", "cat", "mat"],
            answer: "fig",
            correctIndex: 0
          },
          {
            question: "Fill in the blank: She used a blue ____.",
            options: ["rug", "pen", "pig"],
            answer: "pen",
            correctIndex: 1
          }
        ]
      }
    }
  },

  5: {
    id: 5,
    title: "Forest Fun - Short o Words",
    focus: "Forest Fun - Short o",
    unit: 2,
    unitTitle: "Weather & Play",
    objective: "I can read short o words and remember old words too.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Hop, stop, drop on the spot—Let's read a lot!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "fox", emoji: "🦊", image: "orange fox", instruction: "Say it slow and then fast." },
          { word: "log", emoji: "🪵", image: "tree log", instruction: "Tap each sound with your hand: l-o-g." },
          { word: "top", emoji: "🪀", image: "spinning top", instruction: "Spin as you say it." },
          { word: "box", emoji: "📦", image: "brown box", instruction: "Clap the sounds out loud: b-o-x." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "The fox jumps on a log.", "A top spins near the box.", "The fox sees a fig in the box.",
          "It puts the fig on the log.", "The top hits the log and drops.", "The fox hops off!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "fox", emoji: "🦊" }, { word: "log", emoji: "🪵" },
            { word: "top", emoji: "🪀" }, { word: "box", emoji: "📦" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is brown and big.", answer: "box" },
            { sentence: "A red ____ spins on the rug.", answer: "top" },
            { sentence: "The ____ ran to the fig.", answer: "fox" },
            { sentence: "The ____ fell off the bed.", answer: "log" },
            { sentence: "I saw a pen in the ____.", answer: "box" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Spun the top", "Sat on the log", "Opened the box", "Ran from the fox", "Put a fig in the box"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Fox and box, top and log, Time to rhyme in the fog!",
        instruction: "Say the chant to someone at home.",
        homework: "Draw a forest scene with all four words hidden in it."
      }
    }
  },

  6: {
    id: 6,
    title: "Muddy Fun - Short u Words",
    focus: "Muddy Fun - Short u",
    unit: 2,
    unitTitle: "Weather & Play",
    objective: "I can read short u words and write them too.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Mud, sun, run for fun! Jump and hum!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "sun", emoji: "☀️", image: "bright yellow sun", instruction: "Say each sound as you draw the sun: s-u-n." },
          { word: "bug", emoji: "🐛", image: "green bug", instruction: "Tap and say each letter: b-u-g." },
          { word: "mug", emoji: "☕", image: "coffee mug", instruction: "Hold your hands like a cup." },
          { word: "rug", emoji: "🧸", image: "small rug", instruction: "Whisper the word, then shout it." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "The bug sat on a rug.", "The sun was hot and big.", "I saw a mug on the rug.",
          "The mug had juice for the bug.", "The bug ran under the rug.", "The mug tipped and made a mess!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "sun", emoji: "☀️" }, { word: "bug", emoji: "🐛" },
            { word: "mug", emoji: "☕" }, { word: "rug", emoji: "🧸" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is in the sky.", answer: "sun" },
            { sentence: "The ____ is green and tiny.", answer: "bug" },
            { sentence: "My hot drink is in a ____.", answer: "mug" },
            { sentence: "I sit on a soft ____.", answer: "rug" },
            { sentence: "The bug ran under the ____.", answer: "rug" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Drank from the mug", "Napped on the rug", "Hid from the sun", "Watched a bug", "Spilled juice on the rug"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Bug in the mug, rug in the sun, Let's read these words just for fun!",
        instruction: "Say the chant to someone at home.",
        homework: "Cut out four boxes and draw one word in each."
      }
    }
  },

  7: {
    id: 7,
    title: "Rainy Day Play - Consonant Blends",
    focus: "Rainy Day - Blends",
    unit: 2,
    unitTitle: "Weather & Play",
    objective: "I can read blend words and talk about the weather.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Splash and splatter, drip and drop—Rainy day, don't ever stop!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "rain", emoji: "🌧️", image: "falling rain", instruction: "Say it and sway like rain." },
          { word: "drip", emoji: "💧", image: "water drip", instruction: "Tap each sound softly: d-r-i-p." },
          { word: "flag", emoji: "🚩", image: "red flag", instruction: "Wave your hand as you say it." },
          { word: "frog", emoji: "🐸", image: "green frog", instruction: "Hop and say each sound: f-r-o-g." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "A frog sat by a red flag.", "Drip, drip went the rain.", "The frog saw a big drip.",
          "It hid under the flag.", "The rain fell on the frog.", "Drip! Splash! Jump!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "rain", emoji: "🌧️" }, { word: "drip", emoji: "💧" },
            { word: "flag", emoji: "🚩" }, { word: "frog", emoji: "🐸" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is falling from the sky.", answer: "rain" },
            { sentence: "I saw a ____ on the pole.", answer: "flag" },
            { sentence: "The ____ is green and jumps.", answer: "frog" },
            { sentence: "The ____ made a sound.", answer: "drip" },
            { sentence: "A frog sat in the ____.", answer: "rain" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Jumped in the rain", "Waved the flag", "Heard the drip", "Chased a frog", "Slept under the flag"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Rain and flag, drip and frog, Hop and splash like a playful dog!",
        instruction: "Say the chant to someone at home.",
        homework: "Make a rainy-day drawing with all four words included."
      }
    }
  },

  8: {
    id: 8,
    title: "Unit 2 Review - Blends and Digraphs",
    focus: "Unit 2 Review",
    unit: 2,
    unitTitle: "Weather & Play",
    objective: "I can read blend and digraph words from memory.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Crack and crash, drip and drop—Let's read and never stop!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "rain", emoji: "🌧️", image: "rainy cloud", instruction: "Say the sounds like ra-in." },
          { word: "frog", emoji: "🐸", image: "frog jumping", instruction: "Hop and spell it aloud." },
          { word: "drip", emoji: "💧", image: "falling drop", instruction: "Say the sounds, then clap." },
          { word: "flag", emoji: "🚩", image: "waving flag", instruction: "Wave and say the word." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "Drip, drip went the rain.", "A frog hid near the flag.", "The flag was red and wet.",
          "The frog saw a big drip.", "It jumped fast across the path.", "Rain splashed on the flag again."
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "rain", emoji: "🌧️" }, { word: "frog", emoji: "🐸" },
            { word: "drip", emoji: "💧" }, { word: "flag", emoji: "🚩" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ is green and jumps.", answer: "frog" },
            { sentence: "A red ____ flew in the wind.", answer: "flag" },
            { sentence: "I saw a ____ on my hand.", answer: "drip" },
            { sentence: "The ____ made the ground wet.", answer: "rain" },
            { sentence: "The frog sat near the ____.", answer: "flag" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Held the flag", "Jumped in the rain", "Watched the frog", "Got wet from a drip", "Ran under the flag"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Rain and flag, frog and drip, Read these words with every lip!",
        instruction: "Say the chant to someone at home.",
        homework: "Make a weather mini-book using all four words."
      }
    }
  },

  // CHECKPOINT QUIZ 2
  "quiz2": {
    id: "quiz2",
    title: "Unit 2 Checkpoint Quiz",
    focus: "Unit 2 Checkpoint",
    unit: 2,
    unitTitle: "Weather & Play",
    type: "checkpoint",
    objective: "I can remember and use words from Lessons 5 to 8.",
    activities: ['quiz'],
    
    content: {
      quiz: {
        title: "Checkpoint Quiz - Unit 2",
        type: "multiple-choice",
        instruction: "Read each question and choose your answer.",
        questions: [
          {
            question: "What do you wave in the wind?",
            options: ["frog", "flag", "drip"],
            answer: "flag",
            correctIndex: 1
          },
          {
            question: "What animal hops?",
            options: ["drip", "flag", "frog"],
            answer: "frog",
            correctIndex: 2
          },
          {
            question: "What falls when it rains?",
            options: ["cat", "drip", "cake"],
            answer: "drip",
            correctIndex: 1
          },
          {
            question: "Fill in the blank: The ____ is green and jumps.",
            options: ["box", "rug", "frog"],
            answer: "frog",
            correctIndex: 2
          },
          {
            question: "What makes things wet?",
            options: ["rain", "pen", "log"],
            answer: "rain",
            correctIndex: 0
          }
        ]
      }
    }
  },

  9: {
    id: 9,
    title: "Windy Walk - Spiral Review",
    focus: "Windy Walk - Review",
    unit: 2,
    unitTitle: "Weather & Play",
    objective: "I can use words from both units in fun ways.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Sun and rain, drip and hop—Let's keep learning, never stop!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "cat", emoji: "🐱", image: "small cat", instruction: "Say it with claps." },
          { word: "drip", emoji: "💧", image: "rain drop", instruction: "Whisper and point." },
          { word: "frog", emoji: "🐸", image: "jumping frog", instruction: "Jump as you say it." },
          { word: "sun", emoji: "☀️", image: "bright sun", instruction: "Trace it in the air." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "The sun was up.", "A frog sat on the rug.", "A cat saw a drip fall.",
          "The frog ran from the cat.", "The sun made the rug dry.", "The frog came back."
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "cat", emoji: "🐱" }, { word: "frog", emoji: "🐸" },
            { word: "drip", emoji: "💧" }, { word: "sun", emoji: "☀️" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "The ____ jumped fast.", answer: "frog" },
            { sentence: "A drop of water is a ____.", answer: "drip" },
            { sentence: "The ____ is warm.", answer: "sun" },
            { sentence: "I saw a pink ____.", answer: "cat" },
            { sentence: "The cat slept in the ____.", answer: "sun" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Ran from the drip", "Jumped in the sun", "Chased the cat", "Hopped past the frog", "Took a nap in the sun"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Sun and frog, cat and drip—Let's rhyme fast, skip skip skip!",
        instruction: "Say the chant to someone at home.",
        homework: "Draw one scene using all four review words."
      }
    }
  },

  10: {
    id: 10,
    title: "Sunny Streets - Long a Words",
    focus: "Sunny Streets - Long a",
    unit: 3,
    unitTitle: "Our World",
    objective: "I can read long a words with silent e.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Make and bake, play all day—Read the words the silent way!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "cake", emoji: "🍰", image: "slice of cake", instruction: "Say: 'C-A-K-E! Silent E!'" },
          { word: "gate", emoji: "🚪", image: "wooden gate", instruction: "Knock as you say it." },
          { word: "rake", emoji: "🍂", image: "leaf rake", instruction: "Pretend to rake." },
          { word: "plane", emoji: "✈️", image: "flying plane", instruction: "Fly your hand as you read." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "I see a cake by the gate.", "The plane zooms past the rake.", "He bakes a cake and waves.",
          "The gate swings in the breeze.", "I use the rake to clean.", "Then I eat my cake!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "cake", emoji: "🍰" }, { word: "gate", emoji: "🚪" },
            { word: "rake", emoji: "🍂" }, { word: "plane", emoji: "✈️" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "I bake a ____.", answer: "cake" },
            { sentence: "The ____ is made of wood.", answer: "gate" },
            { sentence: "I fly in a ____.", answer: "plane" },
            { sentence: "Dad used a ____.", answer: "rake" },
            { sentence: "A plane flew past the ____.", answer: "gate" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Baked a cake", "Opened the gate", "Flew in a plane", "Cleaned with a rake", "Ate the cake under the gate"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Cake, rake, gate and plane—Let's read them all again!",
        instruction: "Say the chant to someone at home.",
        homework: "Draw a silent e word for each picture."
      }
    }
  },

  11: {
    id: 11,
    title: "Home Helpers - Long i Words",
    focus: "Home Helpers - Long i",
    unit: 3,
    unitTitle: "Our World",
    objective: "I can read long i words with silent e.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Slide and glide, time to ride—Words with i will fill our side!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "bike", emoji: "🚲", image: "red bike", instruction: "Pretend to ride." },
          { word: "kite", emoji: "🪁", image: "flying kite", instruction: "Move your hand like a kite." },
          { word: "pipe", emoji: "🧯", image: "water pipe", instruction: "Say it with puffed cheeks." },
          { word: "time", emoji: "⏰", image: "clock", instruction: "Tap your wrist like a watch." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "It is time to ride a bike.", "I fly a kite in the yard.", "The pipe drips near the bike.",
          "The kite pulls in the wind.", "I check the time and smile.", "It's play time!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "bike", emoji: "🚲" }, { word: "kite", emoji: "🪁" },
            { word: "pipe", emoji: "🧯" }, { word: "time", emoji: "⏰" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "I rode my ____.", answer: "bike" },
            { sentence: "The ____ flew high.", answer: "kite" },
            { sentence: "I looked at the ____.", answer: "time" },
            { sentence: "Water dripped from the ____.", answer: "pipe" },
            { sentence: "It's fun to fly a ____.", answer: "kite" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Rode a bike", "Checked the time", "Fixed a pipe", "Flew a kite", "Sang about time on a bike"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Kite, pipe, time and bike—Read these words and take a hike!",
        instruction: "Say the chant to someone at home.",
        homework: "Make a 'Silent e' mini-book with four drawings."
      }
    }
  },

  12: {
    id: 12,
    title: "Final Review",
    focus: "Final Review",
    unit: 3,
    unitTitle: "Our World",
    objective: "I can read long vowel words and use them in sentences.",
    activities: ['warmup', 'vocabulary', 'story', 'practice', 'quiz', 'wrapup'],
    
    content: {
      warmup: {
        title: "Warm-Up",
        chant: "Time and gate, pipe and plane—Let's read them all again!",
        direction: "Read and act it out."
      },
      vocabulary: {
        title: "Learn the Words",
        words: [
          { word: "plane", emoji: "✈️", image: "flying plane", instruction: "Fly your hand as you read." },
          { word: "kite", emoji: "🪁", image: "flying kite", instruction: "Move your hand like a kite." },
          { word: "cake", emoji: "🍰", image: "slice of cake", instruction: "Say: 'C-A-K-E! Silent E!'" },
          { word: "time", emoji: "⏰", image: "clock", instruction: "Tap your wrist like a watch." }
        ]
      },
      story: {
        title: "Mini-Story",
        sentences: [
          "I made a cake at lunch time.", "The plane flew past the kite.", "We played in the yard.",
          "The clock showed snack time.", "I smiled at the flying kite.", "Yum!"
        ],
        encouragement: "Great! Read it again for practice."
      },
      practice: {
        title: "Let's Practice!",
        activityA: {
          title: "Activity A - Matching",
          type: "matching",
          instruction: "Draw lines or point with your finger.",
          pairs: [
            { word: "plane", emoji: "✈️" }, { word: "kite", emoji: "🪁" },
            { word: "cake", emoji: "🍰" }, { word: "time", emoji: "⏰" }
          ]
        },
        activityB: {
          title: "Activity B - Fill-in-the-Blank",
          type: "fill-blank",
          instruction: "Write the word or say it aloud.",
          questions: [
            { sentence: "I saw a ____.", answer: "plane" },
            { sentence: "It is lunch ____.", answer: "time" },
            { sentence: "I baked a ____.", answer: "cake" },
            { sentence: "The ____ flew high.", answer: "kite" },
            { sentence: "The ____ flew near the kite.", answer: "plane" }
          ]
        }
      },
      quiz: {
        title: "Creative Quiz - Who Did It?",
        type: "character-matching",
        instruction: "Match each animal to one action. You can draw lines.",
        characters: [
          { name: "Ellie the Elephant", emoji: "🐘" }, { name: "Benny the Bear", emoji: "🐻" },
          { name: "Lila the Lion", emoji: "🦁" }, { name: "Milo the Monkey", emoji: "🐒" }, { name: "Tina the Tiger", emoji: "🐯" }
        ],
        actions: ["Baked a cake", "Watched the time", "Flew the kite", "Ate cake near the plane", "Took a nap at snack time"]
      },
      wrapup: {
        title: "Wrap-Up",
        chant: "Kite and plane, cake and time—Say each word in a rhyme!",
        instruction: "Say the chant to someone at home.",
        homework: "Write one sentence for each of today's words."
      }
    }
  },

  // CHECKPOINT QUIZ 3 (Final Quiz)
  "quiz3": {
    id: "quiz3",
    title: "Unit 3 Checkpoint Quiz",
    focus: "Unit 3 Checkpoint",
    unit: 3,
    unitTitle: "Our World",
    type: "checkpoint",
    objective: "I can read long vowel words and use them in sentences.",
    activities: ['quiz'],
    
    content: {
      quiz: {
        title: "Checkpoint Quiz - Unit 3",
        type: "multiple-choice",
        instruction: "Read each question and choose your answer.",
        questions: [
          {
            question: "What has a silent e?",
            options: ["cat", "rake", "mug"],
            answer: "rake",
            correctIndex: 1
          },
          {
            question: "What do you ride?",
            options: ["kite", "bike", "rug"],
            answer: "bike",
            correctIndex: 1
          },
          {
            question: "Which one tells you when to eat?",
            options: ["time", "frog", "bed"],
            answer: "time",
            correctIndex: 0
          },
          {
            question: "Fill in the blank: I flew a ____.",
            options: ["kite", "pipe", "cake"],
            answer: "kite",
            correctIndex: 0
          },
          {
            question: "What flies in the sky?",
            options: ["gate", "plane", "fox"],
            answer: "plane",
            correctIndex: 1
          }
        ]
      }
    }
  }
};

// Helper functions
export const getLessonById = (id) => {
  return lessonData[id] || null;
};

export const getAllLessons = () => {
  return Object.values(lessonData);
};

export const getLessonsByUnit = (unitNumber) => {
  return Object.values(lessonData).filter(lesson => lesson.unit === unitNumber);
};

export const getNextActivity = (lessonId, currentActivity) => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  
  const currentIndex = lesson.activities.indexOf(currentActivity);
  if (currentIndex === -1 || currentIndex === lesson.activities.length - 1) {
    return null; // No next activity
  }
  
  return lesson.activities[currentIndex + 1];
};

export const getPreviousActivity = (lessonId, currentActivity) => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  
  const currentIndex = lesson.activities.indexOf(currentActivity);
  if (currentIndex <= 0) {
    return null; // No previous activity
  }
  
  return lesson.activities[currentIndex - 1];
};

// Activity type configurations
export const activityConfig = {
  warmup: {
    name: "Warm-Up",
    icon: "🎵",
    description: "Get ready with a fun chant!",
    color: "bg-yellow-100 border-yellow-300"
  },
  vocabulary: {
    name: "Vocabulary", 
    icon: "📚",
    description: "Learn new words",
    color: "bg-blue-100 border-blue-300"
  },
  story: {
    name: "Story Time",
    icon: "📖", 
    description: "Read a mini story",
    color: "bg-green-100 border-green-300"
  },
  practice: {
    name: "Practice",
    icon: "✏️",
    description: "Try matching and fill-in activities",
    color: "bg-purple-100 border-purple-300"
  },
  quiz: {
    name: "Quiz",
    icon: "🎯",
    description: "Fun character matching game or checkpoint quiz",
    color: "bg-red-100 border-red-300"
  },
  wrapup: {
    name: "Wrap-Up",
    icon: "🎉",
    description: "Finish with a chant and homework",
    color: "bg-pink-100 border-pink-300"
  }
};
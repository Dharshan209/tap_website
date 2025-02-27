import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, BookText, Wand2, FileText, LayoutTemplate, X } from 'lucide-react';

// Available book types
const bookTypes = [
  { id: 'realistic', name: 'Realistic Story', description: 'Requires 10-15 images. Professional quality with detailed AI-enhanced illustrations.', icon: <Book className="w-4 h-4 mr-2" /> },
  { id: 'animated', name: 'Animated Story', description: 'Requires only 1 image. Colorful animated visuals generated from a single image.', icon: <BookText className="w-4 h-4 mr-2" /> },
];

// Story options
const storyOptions = [
  { id: 'template', name: 'Template Story', description: 'Choose from our professionally written story templates', icon: <Wand2 className="w-4 h-4 mr-2" /> },
  { id: 'custom', name: 'Write Your Own', description: 'Add your own story text to go with the illustrations', icon: <FileText className="w-4 h-4 mr-2" /> },
];

// Pre-designed story templates with full content
const storyTemplates = [
  { 
    id: 'template1', 
    name: 'Adventure in the Forest', 
    description: 'A magical journey through an enchanted forest',
    fullStory: `# The Enchanted Forest Adventure

Once upon a time, in a village near the edge of a mysterious forest, lived a young child named [Name]. [Name] had always been curious about the forest, with its towering trees and whispered secrets.

One sunny morning, [Name] decided to explore the forest. With a small backpack filled with snacks and a water bottle, [Name] ventured into the woods.

As [Name] walked deeper into the forest, the trees seemed to come alive. The sunlight filtered through the leaves, creating dancing patterns on the forest floor.

Suddenly, [Name] heard a soft melodic sound. Following it, [Name] discovered a small clearing where a tiny fairy with shimmering wings sat on a mushroom.

"Hello!" the fairy said, smiling. "I'm Lily, guardian of this forest. I've been waiting for a brave explorer like you."

Lily told [Name] about the forest's magic and how it was fading because people had forgotten about it. "Only a pure-hearted child can help restore the magic," Lily explained.

Together, [Name] and Lily embarked on a quest through the forest, meeting friendly woodland creatures: a wise old owl, a playful squirrel family, and a majestic deer.

Each animal gave [Name] a special gift: the owl offered wisdom, the squirrels shared joy, and the deer showed [Name] the path of courage.

With these gifts, [Name] reached the heart of the forest, where a magnificent ancient tree stood. [Name] placed a hand on the tree and felt a warm glow spread through the forest.

The magic was restored! Colors became brighter, flowers bloomed, and the forest hummed with renewed energy.

Lily thanked [Name] for bringing magic back to the forest. "You'll always be welcome here," she said, giving [Name] a small acorn pendant as a token of friendship.

As the sun began to set, [Name] headed home, knowing that the forest would always be there, full of wonder and magic, waiting for the next adventure.

And sometimes, on quiet nights, [Name] would look out the window and see a tiny shimmering light—Lily, coming to visit and share more stories of the enchanted forest.

The End`
  },
  { 
    id: 'template2', 
    name: 'Ocean Discovery', 
    description: 'Exploring the wonders beneath the sea',
    fullStory: `# The Underwater Kingdom

In a coastal town with waters as blue as the sky, lived an adventurous child named [Name]. [Name] loved the ocean and would spend hours watching the waves roll onto the shore.

One day, while playing at the beach, [Name] found a beautiful shell that sparkled in the sunlight. As [Name] picked it up, a tiny voice called out, "Hello there!"

[Name] looked around in surprise and discovered the voice came from the shell. Inside was a tiny, colorful sea horse named Marina.

"I need your help," Marina explained. "Our underwater kingdom is in trouble. Would you be brave enough to come with me?"

Without hesitation, [Name] agreed. Marina sprinkled some magical sea dust over [Name], allowing them to breathe underwater.

Together, they dove into the ocean and entered a spectacular world. Colorful coral reefs formed an underwater city where fish of all shapes and sizes swam by to greet them.

Marina led [Name] to the Grand Coral Palace where they met King Neptune, ruler of the underwater kingdom. His crown was missing its central pearl, which gave life and balance to the ocean.

"Without the pearl, our kingdom will fade away," King Neptune explained. "Only someone from the land can help us find it."

[Name] promised to help and set off with Marina on an exciting underwater quest. They explored deep ocean trenches, swam with playful dolphins, and even made friends with a gentle whale.

After many adventures, they discovered the missing pearl had been trapped in an old fishing net. [Name] carefully freed it and they triumphantly returned to the palace.

King Neptune placed the pearl back in his crown, and immediately the ocean began to glow with renewed life and color. The fish swam more energetically, and the coral glowed brighter.

As a thank you, King Neptune gave [Name] a special necklace with a tiny pearl. "This will allow you to visit us whenever you wish," he said with a smile.

When it was time to go home, Marina and all their new underwater friends waved goodbye as [Name] returned to the shore.

Back on land, [Name] wore the special necklace every day. And whenever [Name] wanted to visit the underwater kingdom, all they had to do was stand by the ocean, hold the pearl, and whisper Marina's name.

The End`
  },
  { 
    id: 'template3', 
    name: 'Space Explorer', 
    description: 'A journey to the stars and beyond',
    fullStory: `# The Stellar Adventure

In a small house with a big window perfect for stargazing lived a dreamer named [Name]. Every night, [Name] would look up at the stars, wondering what adventures might wait beyond the twinkling lights.

One night, as [Name] was watching a meteor shower, a small shooting star seemed to grow larger and larger until—with a soft whoosh—it landed right in [Name]'s backyard!

It wasn't a shooting star at all, but a tiny spaceship! The door opened, and out stepped a small alien with blue skin and friendly eyes.

"Greetings, Earthling! I am Zorbo from the planet Lumina," the alien said. "I've come to find someone brave and curious to help me on an important mission. Would you like to join me?"

[Name]'s eyes widened with excitement. "Yes!" [Name] replied without hesitation.

Inside Zorbo's spaceship, [Name] buckled into a seat made of what looked like stardust. With a press of a button, they zoomed off into space, leaving Earth behind.

Their first stop was the Moon, where they bounced and played in the low gravity. Next, they visited Mars and raced across its red plains.

Zorbo explained that stars throughout the galaxy were beginning to dim because people on different planets had forgotten the importance of imagination and wonder.

Their mission was to collect stardust from the brightest stars and deliver it to the Cosmic Library at the center of the galaxy.

Together, [Name] and Zorbo visited magnificent planets: one made entirely of crystals, another with rainbow rings, and even one where the clouds were made of cotton candy!

At each place, they collected a unique type of stardust, each glowing with a different color and energy.

Finally, they reached the Cosmic Library, an enormous building that seemed to float in space. Inside, thousands of books contained all the stories and knowledge of the universe.

The Librarian, an ancient being with stars in her eyes, helped [Name] and Zorbo place the stardust in a special container that powered the library's lights.

As they added each sample of stardust, the lights of the library grew brighter, and the stars in the surrounding space began to shine more intensely too.

"Thank you," the Librarian said to [Name]. "Your sense of wonder and adventure has helped restore imagination to our galaxy."

As a farewell gift, the Librarian gave [Name] a special book that would glow whenever a new adventure was about to begin.

Zorbo flew [Name] back to Earth just before sunrise. "Remember," Zorbo said, "the greatest adventures begin with curiosity and imagination."

Back home, [Name] placed the special book on the nightstand. Sometimes it would glow softly, and [Name] would open it to find new stories about far-off worlds and cosmic adventures.

And on clear nights, when the stars twinkled especially bright, [Name] would sometimes see a tiny blue light zooming across the sky—Zorbo, waving hello on his way to another adventure.

The End`
  }
];

// Available themes for the story
const storyThemes = [
  { id: 'fantasy', name: 'Fantasy', description: 'Magical adventures with dragons, wizards, and mythical creatures' },
  { id: 'space', name: 'Space Adventure', description: 'Exciting journeys through space, planets, and stars' },
  { id: 'animals', name: 'Animal Kingdom', description: 'Fun adventures with talking animals and wildlife' },
  { id: 'superhero', name: 'Superhero', description: 'Epic stories with superpowers and saving the day' },
  { id: 'ocean', name: 'Ocean Explorer', description: 'Discovering the mysteries beneath the waves' },
  { id: 'nature', name: 'Nature Explorer', description: 'Adventuring through forests, mountains, and natural wonders' },
];

const BookCustomizationForm = ({ formData, setFormData, errors }) => {
  // State for story preview modal
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Book type selection is now handled in parent component
  
  // Handle story option selection
  const handleStoryOptionSelect = (optionId) => {
    setFormData((prev) => ({ ...prev, storyOption: optionId }));
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setFormData((prev) => ({ 
      ...prev, 
      storyOption: 'template', 
      selectedTemplate: templateId 
    }));
  };
  
  // Preview a story template
  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setShowStoryPreview(true);
  };

  // Animation variants for theme cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">

        {/* Name Input */}
        <div>
          <label htmlFor="childName" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            placeholder="Enter name"
            className={`w-full px-3 py-2 border ${
              errors.childName ? 'border-destructive' : 'border-input'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors`}
          />
          {errors.childName && (
            <p className="text-destructive text-xs mt-1">{errors.childName}</p>
          )}
        </div>

        {/* Age Input (Optional) */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-1">
            Age (Optional)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter age"
            min="1"
            max="12"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        {/* Story Option Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Story Options</label>
          
          <div className="grid grid-cols-1 gap-3 mb-4">
            {storyOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.storyOption === option.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handleStoryOptionSelect(option.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${
                      formData.storyOption === option.id
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {formData.storyOption === option.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center">{option.icon} {option.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Custom Story Textarea (only shown when 'custom' is selected) */}
          {formData.storyOption === 'custom' && (
            <div className="mt-3">
              <label htmlFor="customStory" className="block text-sm font-medium mb-1">
                Your Story
              </label>
              <textarea
                id="customStory"
                name="customStory"
                value={formData.customStory}
                onChange={handleChange}
                placeholder="Write your story here (minimum 200 words recommended)"
                rows="6"
                className={`w-full px-3 py-2 border ${
                  errors.customStory ? 'border-destructive' : 'border-input'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors`}
              />
              {errors.customStory && (
                <p className="text-destructive text-xs mt-1">{errors.customStory}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your story will be paired with the illustrations to create a cohesive book.
              </p>
            </div>
          )}
          
          {/* Story Templates (shown when Template Story is selected) */}
          {formData.storyOption === 'template' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-3">
                <div className="flex items-center">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Choose a Story Template
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Select one of our professionally written stories
                </p>
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {storyTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      formData.selectedTemplate === template.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.selectedTemplate === template.id
                              ? 'border-primary'
                              : 'border-muted-foreground'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          {formData.selectedTemplate === template.id && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm">{template.name}</h3>
                      </div>
                      
                      <button 
                        className="text-primary hover:text-primary/80 text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTemplate(template);
                        }}
                      >
                        Preview Story
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Story Preview Modal */}
          {showStoryPreview && previewTemplate && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center">
                  <h3 className="font-bold text-lg">{previewTemplate.name}</h3>
                  <button 
                    onClick={() => setShowStoryPreview(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {previewTemplate.fullStory.split('\n').map((paragraph, i) => {
                      // Check if it's a heading (starts with #)
                      if (paragraph.startsWith('# ')) {
                        return <h1 key={i} className="text-2xl font-bold mb-4">{paragraph.substring(2)}</h1>;
                      } else if (paragraph === '') {
                        return <br key={i} />;
                      } else {
                        return <p key={i} className="mb-4">{paragraph}</p>;
                      }
                    })}
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t">
                  <button 
                    onClick={() => {
                      handleTemplateSelect(previewTemplate.id);
                      setShowStoryPreview(false);
                    }}
                    className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Select This Story
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Additional Notes (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requests or details you'd like us to know"
            rows="3"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default BookCustomizationForm;
import fs from 'fs';

// Let's check section 1 text in section1_planner_clean.png or section1_planner.png
console.log('Exists clean?', fs.existsSync('public/assets/section1_planner_clean.png'));
console.log('Exists orig?', fs.existsSync('public/assets/section1_planner.png'));


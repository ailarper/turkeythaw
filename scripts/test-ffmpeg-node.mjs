import { spawn } from 'child_process';
import fs from 'fs';

const args = [
  '-f', 'lavfi',
  '-i', 'color=c=black:s=1920x1080:r=60:d=5',
  '-i', 'tools/brag/skills/brag/assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3',
  '-i', 'tools/brag/skills/brag/assets/sfx/interface/click_001.ogg',
  '-filter_complex', '[1:a]atrim=0:5,asetpts=PTS-STARTPTS,volume=0.35[bgm];[2:a]adelay=2000|2000,volume=0.8[sfx];[bgm][sfx]amix=inputs=2:duration=first[aout]',
  '-map', '0:v',
  '-map', '[aout]',
  '-c:v', 'libx264',
  '-t', '5',
  '-y', 'scripts/test_audio_mix.mp4'
];

const proc = spawn('ffmpeg', args);
proc.stderr.on('data', d => process.stderr.write(d.toString()));
proc.on('close', code => {
  console.log('FFmpeg exited with code:', code);
  if (code === 0 && fs.existsSync('scripts/test_audio_mix.mp4')) {
    console.log('Successfully created scripts/test_audio_mix.mp4!');
  }
});


import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavHeader(numSamples, channels = 2) {
  const byteRate = SAMPLE_RATE * channels * 2;
  const blockAlign = channels * 2;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

// 1. Generate UI Click (0.04s)
function generateClick() {
  const duration = 0.04;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataBuffer = Buffer.alloc(numSamples * 4); // stereo 16-bit

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 120);
    // 1400Hz blip + pitch dive
    const freq = 1400 * Math.exp(-t * 60) + 300;
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.7;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
    dataBuffer.writeInt16LE(intSample, i * 4);
    dataBuffer.writeInt16LE(intSample, i * 4 + 2);
  }

  return Buffer.concat([createWavHeader(numSamples, 2), dataBuffer]);
}

// 2. Generate Whoosh / Impact Hit (0.45s)
function generateWhoosh() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataBuffer = Buffer.alloc(numSamples * 4);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Attack-decay envelope
    const env = t < 0.15 ? Math.sin((t / 0.15) * (Math.PI / 2)) : Math.exp(-(t - 0.15) * 8);
    // Sweeping noise + sub impact
    const noise = (Math.random() * 2 - 1) * 0.4;
    const subFreq = 180 * Math.exp(-t * 5) + 45;
    const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.6;
    const sweepFreq = 600 + Math.sin(t * 10) * 300;
    const tonal = Math.sin(2 * Math.PI * sweepFreq * t) * 0.2;

    const sample = (noise * 0.4 + sub * 0.7 + tonal * 0.3) * env;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
    dataBuffer.writeInt16LE(intSample, i * 4);
    dataBuffer.writeInt16LE(intSample, i * 4 + 2);
  }

  return Buffer.concat([createWavHeader(numSamples, 2), dataBuffer]);
}

// 3. Generate Crisp Emerald Chime (1.3s)
function generateChime() {
  const duration = 1.3;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataBuffer = Buffer.alloc(numSamples * 4);

  // Two harmonic bell frequencies: E5 (659.25Hz) and B5 (987.77Hz) with sparkling octave E6 (1318.5Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env1 = Math.exp(-t * 3.5);
    const env2 = Math.exp(-t * 2.5);
    const env3 = Math.exp(-t * 4.5);

    const f1 = 659.25;
    const f2 = 987.77;
    const f3 = 1318.5;

    const s1 = Math.sin(2 * Math.PI * f1 * t) * env1 * 0.45;
    const s2 = Math.sin(2 * Math.PI * f2 * t) * env2 * 0.35;
    const s3 = Math.sin(2 * Math.PI * f3 * t) * env3 * 0.2;

    const sample = (s1 + s2 + s3) * 0.8;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
    dataBuffer.writeInt16LE(intSample, i * 4);
    dataBuffer.writeInt16LE(intSample, i * 4 + 2);
  }

  return Buffer.concat([createWavHeader(numSamples, 2), dataBuffer]);
}

// 4. Generate Punchy Upbeat Modern Synthwave Track (18.0s)
function generateSynthwaveTrack() {
  const duration = 18.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataBuffer = Buffer.alloc(numSamples * 4);

  const bpm = 124;
  const beatDuration = 60 / bpm; // ~0.4838s
  const stepDuration = beatDuration / 4; // 16th note ~0.1209s

  // D minor bassline notes: D1 (36.7Hz), F1 (43.65Hz), G1 (49Hz), A1 (55Hz), C2 (65.4Hz), D2 (73.4Hz)
  const bassNotes = [73.4, 73.4, 87.3, 73.4, 98.0, 73.4, 110.0, 98.0];

  // Lead arp notes
  const arpNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Fade-out in last 1.2 seconds (frames 16.8s to 18.0s)
    let masterVol = 0.75;
    if (t > 16.8) {
      masterVol = Math.max(0, 0.75 * Math.pow((18.0 - t) / 1.2, 1.8));
    }

    // Beat timing
    const beatPos = (t % beatDuration) / beatDuration;
    const stepIdx = Math.floor(t / stepDuration);
    const stepPos = (t % stepDuration) / stepDuration;

    // 1. Kick Drum (Punchy 4-on-the-floor, active from t > 2.8s)
    let kick = 0;
    if (t > 2.8 && t < 17.0) {
      const kickT = (t % beatDuration);
      if (kickT < 0.22) {
        const kickEnv = Math.exp(-kickT * 18);
        const kickFreq = 140 * Math.exp(-kickT * 28) + 42;
        kick = Math.sin(2 * Math.PI * kickFreq * kickT) * kickEnv * 0.85;
      }
    }

    // 2. Snare / Clapper (on beats 2 and 4, active from t > 3.8s)
    let snare = 0;
    const barBeat = (t / beatDuration) % 4;
    if (t > 3.8 && t < 17.0) {
      const isBeat2 = barBeat >= 1 && barBeat < 1.4;
      const isBeat4 = barBeat >= 3 && barBeat < 3.4;
      if (isBeat2 || isBeat4) {
        const snareT = (barBeat % 1) * beatDuration;
        if (snareT < 0.2) {
          const snareEnv = Math.exp(-snareT * 16);
          const noise = (Math.random() * 2 - 1) * 0.45;
          const body = Math.sin(2 * Math.PI * 220 * snareT) * 0.35;
          snare = (noise + body) * snareEnv * 0.6;
        }
      }
    }

    // 3. Hi-Hat (16th notes with groove)
    let hat = 0;
    if (t > 1.8 && t < 17.0) {
      const hatT = (t % stepDuration);
      if (hatT < 0.05) {
        const hatEnv = Math.exp(-hatT * 60);
        const noise = (Math.random() * 2 - 1);
        const isAccent = (stepIdx % 4) === 2;
        hat = noise * hatEnv * (isAccent ? 0.22 : 0.12);
      }
    }

    // 4. Synthwave Rolling 16th Bass
    let bass = 0;
    if (t > 0.8) {
      const bassNote = bassNotes[stepIdx % bassNotes.length];
      const bassEnv = Math.exp(-stepPos * 7.5);
      // Sawtooth harmonic approximation
      const phase = 2 * Math.PI * bassNote * t;
      const saw = Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase);
      bass = saw * bassEnv * 0.4;
    }

    // 5. Melodic Arpeggio & Chords (comes in strong from t > 4.5s)
    let lead = 0;
    if (t > 4.5) {
      const arpNote = arpNotes[(stepIdx * 2) % arpNotes.length];
      const arpEnv = Math.exp(-stepPos * 8);
      const leadPhase = 2 * Math.PI * arpNote * t;
      // Square/pulse tone with slight chorus
      const tone1 = Math.sin(leadPhase);
      const tone2 = Math.sin(leadPhase * 1.003);
      lead = (tone1 + tone2) * 0.5 * arpEnv * 0.28;
    }

    // 6. Atmospheric Warm Synth Pad (Root chord D minor: D3, F3, A3)
    const padFreqs = [146.83, 174.61, 220.0];
    let pad = 0;
    for (const f of padFreqs) {
      pad += Math.sin(2 * Math.PI * f * t) * 0.06;
    }

    // Mixdown with soft limiter
    const rawLeft = (kick * 0.9 + snare * 0.8 + hat * 0.7 + bass * 0.85 + lead * 0.8 + pad * 0.9) * masterVol;
    const rawRight = (kick * 0.9 + snare * 0.8 + hat * 0.75 + bass * 0.85 + lead * 0.85 + pad * 0.9) * masterVol;

    // Soft saturation clipping to avoid distortion
    const sampleL = Math.tanh(rawLeft * 0.85);
    const sampleR = Math.tanh(rawRight * 0.85);

    const intSampleL = Math.max(-32767, Math.min(32767, Math.floor(sampleL * 32767)));
    const intSampleR = Math.max(-32767, Math.min(32767, Math.floor(sampleR * 32767)));

    dataBuffer.writeInt16LE(intSampleL, i * 4);
    dataBuffer.writeInt16LE(intSampleR, i * 4 + 2);
  }

  return Buffer.concat([createWavHeader(numSamples, 2), dataBuffer]);
}

// Generate files into public/audio/
const audioDir = path.resolve('public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

console.log('Generating audio assets...');
fs.writeFileSync(path.join(audioDir, 'bgm.wav'), generateSynthwaveTrack());
fs.writeFileSync(path.join(audioDir, 'whoosh.wav'), generateWhoosh());
fs.writeFileSync(path.join(audioDir, 'click.wav'), generateClick());
fs.writeFileSync(path.join(audioDir, 'chime.wav'), generateChime());
console.log('All audio assets successfully generated in public/audio/!');

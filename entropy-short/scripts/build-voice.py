"""Generate Mandarin narration with Edge neural TTS, then fit the four slots.

Dependencies: numpy, edge-tts, ffmpeg. No service credentials are used.
Pass --dependency-dir if edge-tts is installed into a temporary directory.
"""

from pathlib import Path
import argparse
import asyncio
import json
import subprocess
import sys
import wave
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument("--dependency-dir")
parser.add_argument("--provider", choices=["edge", "macos"], default="edge")
args = parser.parse_args()
if args.dependency_dir:
    sys.path.insert(0, args.dependency_dir)
if args.provider == "edge":
    import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
RATE = 48000
DURATION = 14.4
SLOTS = [
    (0.35, 3.20, "时间，为什么只朝一个方向走？", "+5%"),
    (3.50, 6.40, "杯子碎了，不会自己拼回去。", "+0%"),
    (6.90, 9.65, "这不是惩罚，是概率。", "-6%"),
    (10.40, 13.80, "所以此刻，才值得被记住。", "-6%"),
]
LOCAL_RATES = [170, 155, 145, 135]


async def generate_one(index, text, rate):
    if args.provider == "macos":
        subprocess.run(["say", "-v", "Eddy (中文（中国大陆）)", "-r", str(LOCAL_RATES[index]),
                        "-o", str(OUT / f"voice-{index+1:02d}.aiff"), text], check=True)
        return
    await edge_tts.Communicate(
        text, voice="zh-CN-YunxiNeural", rate=rate, pitch="-5Hz"
    ).save(str(OUT / f"voice-{index+1:02d}.mp3"))


async def generate():
    await asyncio.gather(*[generate_one(i, text, rate)
                           for i, (_, _, text, rate) in enumerate(SLOTS)])


def read_wav(path):
    with wave.open(str(path)) as wf:
        channels = wf.getnchannels()
        samples = np.frombuffer(wf.readframes(wf.getnframes()), dtype="<i2")
        return samples.reshape(-1, channels).astype(float) / 32768


def write_wav(path, data):
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(data.shape[1])
        wf.setsampwidth(2)
        wf.setframerate(RATE)
        wf.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())


asyncio.run(generate())
voice = np.zeros((round(RATE * DURATION), 2))
report = []
for i, (start, end, text, _) in enumerate(SLOTS):
    raw = OUT / f"voice-{i+1:02d}-raw.wav"
    source = OUT / f"voice-{i+1:02d}.{'aiff' if args.provider == 'macos' else 'mp3'}"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", str(source),
                    "-ar", str(RATE), "-ac", "1", str(raw)], check=True)
    data = read_wav(raw)[:, 0]
    # Preserve natural breaths, but remove the network service's long tail.
    active = np.flatnonzero(np.abs(data) > .004)
    data = data[max(0, active[0] - round(.045 * RATE)):
                min(len(data), active[-1] + round(.100 * RATE))]
    original_duration = len(data) / RATE
    slot = end - start
    target_duration = min(original_duration, slot - .035)
    stretch = original_duration / target_duration
    trimmed = OUT / f"voice-{i+1:02d}-trimmed.wav"
    write_wav(trimmed, data[:, None])
    fitted = OUT / f"voice-{i+1:02d}.wav"
    pitch_filter = "asetrate=46080,aresample=48000," if args.provider == "macos" else ""
    tempo = stretch / .96 if args.provider == "macos" else stretch
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", str(trimmed), "-af",
                    f"{pitch_filter}atempo={tempo:.8f},highpass=f=75,lowpass=f=12500",
                    "-ar", str(RATE), "-ac", "1", str(fitted)], check=True)
    data = read_wav(fitted)[:, 0]
    # Matched peaks give a clear voice level with the ambient bed beneath it.
    data *= .62 / max(.001, np.max(np.abs(data)))
    fade = min(round(.008 * RATE), len(data) // 2)
    data[:fade] *= np.linspace(0, 1, fade)
    data[-fade:] *= np.linspace(1, 0, fade)
    write_wav(fitted, data[:, None])
    begin = round(start * RATE)
    voice[begin:begin+len(data)] += np.column_stack([data, data])
    report.append({"text": text, "start": start, "end": start + len(data) / RATE,
                   "rawDuration": original_duration, "tempoAdjustment": stretch})
    raw.unlink()
    trimmed.unlink()
    source.unlink()

write_wav(OUT / "voiceover.wav", voice)
design = read_wav(OUT / "sound-design.wav")
master = voice + design * .95
write_wav(OUT / "film-mix.wav", master)
report_data = {"provider": "Edge TTS" if args.provider == "edge" else "macOS local TTS",
               "voice": "zh-CN-YunxiNeural" if args.provider == "edge" else "Eddy zh-CN",
               "duration": DURATION, "slots": report,
               "masterPeak": float(np.max(np.abs(master))),
               "masterRms": float(np.sqrt(np.mean(master ** 2)))}
(OUT / "voice-info.json").write_text(json.dumps(report_data, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(report_data, ensure_ascii=False, indent=2))

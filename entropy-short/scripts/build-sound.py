"""Create the original 14.4 s soundtrack, without sample-library dependencies.

Run with Python + numpy. Stems are 48 kHz stereo PCM WAV files.
The sparse, evolving sound bed leaves the centre open for Mandarin narration.
"""

from pathlib import Path
import json
import wave
import numpy as np

RATE = 48000
DURATION = 14.4
OUT = Path(__file__).resolve().parents[1] / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
N = round(RATE * DURATION)
t = np.arange(N) / RATE
rng = np.random.default_rng(3026)


def ease(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def env(start, attack, end, release):
    return ease((t - start) / attack) * (1 - ease((t - end) / release))


def pan(mono, amount):
    angle = (amount + 1) * np.pi / 4
    return np.column_stack([mono * np.cos(angle), mono * np.sin(angle)])


def write(name, data):
    with wave.open(str(OUT / name), "wb") as wf:
        wf.setnchannels(data.shape[1] if data.ndim > 1 else 1)
        wf.setsampwidth(2)
        wf.setframerate(RATE)
        wf.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())


def coloured_noise(cutoff_low, cutoff_high):
    noise = rng.normal(size=N)
    spectrum = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(N, 1 / RATE)
    low = ease((freqs - cutoff_low) / max(20, cutoff_low / 2))
    high = 1 - ease((freqs - cutoff_high) / max(50, cutoff_high / 3))
    spectrum *= low * high
    filtered = np.fft.irfft(spectrum, N)
    return filtered / (np.std(filtered) + 1e-9)


music = np.zeros((N, 2))
fade = env(0, 1.5, 13.25, 1.15)

# A deep E / B axis, with a slowly beating pair that keeps motion understated.
for freq, amp, pos in [(41.203, .030, 0), (82.407, .025, -.16),
                       (82.487, .025, .16), (123.471, .015, 0)]:
    phase = 2 * np.pi * freq * t + .025 * np.sin(2 * np.pi * .12 * t)
    music += pan(np.sin(phase) * amp * fade, pos)

# Cool suspended partials: the instability is perceptible without a melody.
for freq, amp, pos, onset in [(246.942, .010, -.6, 0),
                             (311.127, .007, .65, .5),
                             (369.994, .006, -.3, 2.0)]:
    tone = np.sin(2 * np.pi * freq * t + .22 * np.sin(2 * np.pi * .07 * t))
    tone *= amp * env(onset, 2.3, 8.4, 2.0)
    music += pan(tone, pos)

# A broad breath expands at the irreversible transition.
breath = coloured_noise(180, 1400)
breath_env = .004 * fade + .019 * env(2.65, 1.1, 4.0, 1.5)
music += pan(breath * breath_env, -.15)
music += pan(np.roll(breath, 613) * breath_env * .8, .2)

# The final turn warms into an open E major colour.
for freq, amp, pos in [(164.814, .019, -.2), (207.652, .014, .3),
                       (329.628, .010, -.65), (493.883, .007, .7)]:
    tone = np.sin(2 * np.pi * freq * t + .035 * np.sin(2 * np.pi * .18 * t))
    music += pan(tone * amp * env(9.3, 1.4, 13.2, 1.2), pos)

effects = np.zeros_like(music)


def add_bell(start, freq, amp, duration=3.2, pos=0):
    local = t - start
    active = (local >= 0) & (local < duration)
    attack = ease(local / .012)
    bell = np.zeros(N)
    for multiple, weight, decay in [(1, 1, 1.5), (2.76, .2, .6),
                                    (5.4, .09, .28)]:
        bell += weight * np.sin(2 * np.pi * freq * multiple * local) * np.exp(-np.maximum(local, 0) / decay)
    bell *= active * attack * amp * (1 - ease((local - duration + .4) / .4))
    effects[:] += pan(bell, pos)


# A single low impact and brittle, individually pitched glass fragments.
local = t - 3.88
impact = np.sin(2 * np.pi * (110 * local - 42 * local ** 2))
impact *= (local >= 0) * np.exp(-np.maximum(local, 0) / .10) * .12
effects += pan(impact, 0)
for i in range(24):
    start = 3.89 + rng.uniform(0, .38)
    freq = rng.uniform(1700, 6200)
    amp = rng.uniform(.008, .034) * (1 - i / 40)
    add_bell(start, freq, amp, rng.uniform(.2, .65), rng.uniform(-.8, .8))
glass_noise = coloured_noise(2200, 11000)
effects += pan(glass_noise * env(3.88, .006, 3.91, .085) * .065, 0)

# A faint ticking field dissolves into a warm, long-decay glint.
for start, freq, amp, pos in [(7.06, 1800, .020, -.5), (7.41, 2150, .017, .4),
                             (8.03, 2430, .013, -.2), (8.79, 2830, .010, .6)]:
    add_bell(start, freq, amp, .3, pos)
add_bell(10.3, 659.255, .052, 3.6, -.3)
add_bell(10.42, 987.767, .024, 3.3, .35)

# Gentle diffusion is synthetic and deterministic; no copyrighted samples.
for delay, gain in [(.071, .14), (.137, .09), (.229, .065), (.367, .045)]:
    shift = round(delay * RATE)
    effects[shift:] += effects[:-shift][:, ::-1] * gain
effects *= (1 - ease((t - 13.5) / .9))[:, None]

write("ambient.wav", music)
write("effects.wav", effects)
write("sound-design.wav", music + effects)

stats = {name: {"duration": DURATION, "peak": float(np.max(np.abs(data))),
                "rms": float(np.sqrt(np.mean(data ** 2)))}
         for name, data in [("ambient.wav", music), ("effects.wav", effects),
                             ("sound-design.wav", music + effects)]}
(OUT / "audio-info.json").write_text(json.dumps(stats, indent=2) + "\n")
print(json.dumps(stats, indent=2))

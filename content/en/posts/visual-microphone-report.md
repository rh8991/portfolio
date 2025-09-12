---
title: "Turning Images Into Sound: A Review of the Visual Microphone"
subtitle: "A technical review and reflection by Ronel Herzass"
date: 2025-09-11
tags: ["signal-processing","acoustics","computer-vision","rolling shutter","phase-based motion","study review"]
minutes: 15
---

## Introduction

Recently, I had the opportunity to dive into the fascinating world of visual acoustics as part of an assignment in my Electrical Engineering studies. The inspiration for this technical review came from the groundbreaking work presented in [The Visual Microphone: Passive Recovery of Sound from Video](https://people.csail.mit.edu/mrub/VisualMic/) by Abe Davis and colleagues, as well as the insightful [YouTube presentation](https://www.youtube.com/watch?v=FKXOucXB4a8&ab_channel=AbeDavis%27sResearch) that visually demonstrates the concept.

This post summarizes and reflects on the key ideas, methodology, and results of the study, aiming to make the technical details accessible to fellow students and enthusiasts. The review is based on the original paper, the video presentation, and my own understanding developed through the assignment.

## What is the Visual Microphone?

The core idea is that sound waves cause tiny vibrations on visible surfaces. By analyzing high-speed video, it is possible to estimate these vibrations and **recover the underlying audio**. Everyday objects—like a bag of chips—can act as passive microphones, capturing sound in a way that is invisible to the naked eye but detectable through careful image analysis.

## How Does It Work? (Methodology)

### General process

1. **Multi-scale, multi-orientation decomposition.** Each frame is decomposed with a complex steerable pyramid [4], producing band-pass coefficients with local amplitude and phase.
2. **Phase-based motion estimation.** For each spatial location and band, phase changes relative to a reference frame approximate **sub-pixel motion** along the band orientation.
3. **Aggregation.** Local motion signals are denoised and combined (e.g., SNR-weighted) to produce a single **global motion waveform** proportional to the sound pressure.
4. **Post-processing.**
   - **Denoising:** high-pass (e.g., Butterworth) to suppress slow drift and illumination fluctuations.
   - **Speech enhancement:** for intelligibility, a perceptually motivated enhancement stage [5] is applied.

In their experiments, Davis et al. performed tests both indoors (with controlled lighting) and outdoors (through a glass door). The loudspeaker was mechanically isolated from the target object to avoid direct coupling, and distances ranged **0.5–2 m**. I found it impressive how everyday objects—such as a bag of chips, aluminum foil, or plant leaves—could be used for sound recovery.

**Rolling-shutter mode.** With a CMOS sensor, rows are exposed at slightly different times. Treating each row as a **time sample** enables recovery of higher-frequency content than the nominal frame rate would suggest, given knowledge of row time, readout order, and exposure [2], [3].

### Required equipment

- High-speed camera (e.g., Phantom V10) *or* commodity rolling-shutter camera  
- Full-range loudspeaker  
- Everyday test objects (e.g., **bag of chips**, aluminum foil, plant leaves, etc.)  
- Stable lighting (photography lamp or daylight)

## Results: How Well Does It Work?

The study tested recovery on the **TIMIT** speech corpus and live speech across several objects. Table 1 below compares the **visual microphone (VM)** against a **Laser Doppler Vibrometer (LDV)** for the same scene. The results show that, while the VM is not as accurate as the LDV, it can still recover intelligible speech and music from video alone.

| Sequence                    | Method | SSNR  | LLR Mean | Intelligibility |
|:---------------------------|:------:|:-----:|:--------:|:---------------:|
| Female speaker — fadg0, sa1| VM     | 24.5  | 1.47     | 0.72            |
|                            | LDV    | 28.5  | 1.81     | 0.74            |
| Female speaker — fadg0, sa2| VM     | 28.7  | 1.37     | 0.65            |
|                            | LDV    | 26.5  | 1.82     | 0.70            |
| Male speaker — mccs0, sa1  | VM     | 20.4  | 1.31     | 0.59            |
|                            | LDV    | 26.1  | 1.83     | 0.73            |
| Male speaker — mccs0, sa2  | VM     | 23.2  | 1.55     | 0.67            |
|                            | LDV    | 25.8  | 1.96     | 0.68            |
| Male speaker — mabw0, sa1  | VM     | 23.3  | 1.68     | 0.77            |
|                            | LDV    | 28.2  | 1.74     | 0.76            |
| Male speaker — mabw0, sa2  | VM     | 25.5  | 1.81     | 0.72            |
|                            | LDV    | 26.0  | 1.88     | 0.74            |

**Table 1.** VM vs. LDV on speech recovery.  
*SSNR = Segmental SNR; LLR = Log-Likelihood Ratio (smaller is better).*

High frequencies generally exhibit **lower amplitude** (smaller displacements and material damping). Lighter, compliant objects yielded stronger high-frequency response than rigid, massive objects, consistent with simple mass-spring models. This was one of the most surprising findings for me as a student: the choice of object and its material properties can dramatically affect the quality of recovered sound.

## Reflections & Discussion

The recovered signal is consistent with an **LTI approximation** for small motions: local image phase changes linearly with displacement along the filter orientation. Even when full intelligibility is not achieved, **paralinguistic cues** (speaker count, rough pitch range, activity) can be inferred—relevant to surveillance or scene understanding. As an engineering student, I found the ethical and privacy implications particularly thought-provoking: just because passive capture is possible does not mean it should be used without consent.

**Limitations.**

- **Optics:** sensitivity scales with magnification and SNR; long focal lengths and stable mounts help.  
- **Illumination:** flicker and specularities introduce artifacts; steady, diffuse lighting is preferred.  
- **Geometry & materials:** response varies by object stiffness, damping, and texture; textured, matte surfaces perform best.  
- **Ethics & privacy:** passive capture does not imply permissibility; usage must respect legal and ethical constraints.

**Rolling shutter trade-offs.** While it extends effective sampling along the readout direction, it is **anisotropic** and requires accurate readout timing; motion orthogonal to the readout direction is less observable.

## Conclusions

Passive recovery of audio from **video-only** measurements is feasible across a range of everyday objects. With appropriate optics, illumination, and post-processing, the method yields **intelligible speech** and music in controlled settings. Applications span assistive tech, non-contact metrology, and forensics—while demanding careful consideration of **privacy** and **consent**.

---

*This technical review was completed as part of an assignment in my Electrical Engineering studies. For more details, see the [original study](https://people.csail.mit.edu/mrub/VisualMic/) and [Abe Davis's YouTube presentation](https://www.youtube.com/watch?v=FKXOucXB4a8&ab_channel=AbeDavis%27sResearch).*

If you spot any corrections or would like to share your thoughts, please feel free to reach out via [social media](https://www.linkedin.com/in/ronel-herzass) or [email](mailto:ronelhrzass@gmail.com).

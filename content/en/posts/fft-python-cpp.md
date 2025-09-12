---
title: "Implementing an FFT in Python & C++"
tags: ["dsp","python","c++"]
minutes: 6
---

**Goal.** Compute an FFT, get correct magnitudes, and compare Python vs. C++.

### 1) Windowing

Use a Hann window before the FFT to reduce spectral leakage.

### 2) Scaling

For real signals: divide by *N/2* for single-sided amplitude spectra.

### 3) Validation

Generate a synthetic tone + noise, confirm peak frequency, and verify amplitude vs. theory.

### 4) C++ parity

Use Eigen or kissfft in C++; plot results to compare with Python.

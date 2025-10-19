---
title: "ESP32 BLE EKG Monitor"
subtitle: ""
date: 2025-07-15
tags: ["esp32", "ble", "ekg", "arduino"]
minutes: 5
---

This post documents building an EKG (Electrocardiogram) monitor using an ESP32 microcontroller with Bluetooth Low Energy (BLE) capabilities.

## Overview

- **Hardware:** ESP32, EKG sensor module, connecting wires
- **Software:** Arduino IDE, ESP32 BLE libraries
- **Features:** Real-time EKG data acquisition and wireless transmission via BLE

## Components

| Component      | Description                |
|:---------------|:--------------------------|
| ESP32          | Microcontroller with BLE   |
| EKG Sensor     | Analog heart signal input  |
| Jumper Wires   | Connections                |

## Circuit Diagram

Below is a simple representation of how to connect the EKG sensor to the ESP32. The analog output from the EKG sensor connects to one of the ESP32's analog input pins (e.g., A0). Ensure the sensor's power and ground lines are also connected to the ESP32.

```text
[EKG Sensor]
    |  VCC
    |  GND
    |  OUT ----> [ESP32 A0]
```

## Software Setup

1. Install [Arduino IDE](https://www.arduino.cc/en/software).
2. Add ESP32 board support via Board Manager.
3. Install necessary BLE libraries.

## Sample Code

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>

void setup() {
    Serial.begin(115200);
    // Initialize BLE and EKG sensor
}

void loop() {
    int ekgValue = analogRead(A0);
    // Send ekgValue via BLE
}
```

## BLE Data Transmission

- ESP32 acts as a BLE server.
- EKG data is sent as BLE notifications to a mobile app or PC.

## Visualization

Use apps like [nRF Connect](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-mobile) to receive and plot EKG data.

## References

- [ESP32 BLE Arduino Library](https://github.com/nkolban/ESP32_BLE_Arduino)
- [EKG Sensor Guide](https://www.sparkfun.com/products/12969)

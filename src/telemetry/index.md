---
title: Third Coast Telemetry
author: Stryke Force
title-slide-attributes:
  data-background-color: rgb(241, 186, 27)
---

# Telemetry Checklist

1. [Add Third Coast library](#add-third-coast-library) (`thirdcoast.json`) to robot project's `vendordeps` library.
2. [Set up Telemetry Service](#set-up-telemetry-service) in the `RobotContainer` class.
3. [Register measurable devices](#register-measurable-devices) to be graphed.
4. [Register measurable subsystems](#register-measurable-subsystems) to be graphed.
5. Fire up the Grapher and start measuring.

## Add Third Coast Library

If you haven't already, add the most recent version of Third Coast Java library to the robot project.

```sh
./gradlew vendordep --url=http://maven.strykeforce.org/thirdcoast.json
```

## Set up Telemetry Service

The `RobotContainer` class constructor is the usual place for this.

```java
public RobotContainer() {
    // configure buttons, etc...
    telemetry.register(driveSubsystem);
    telemetry.start();
}
```

## Register Measurable Devices

Much of the hardware we commonly use have pre-configured measurements ready to go. For example, we can choose to register a subsystem's Talon for graphing.

```java
public ClawSubsystem(TelemetryService telemetryService) {
    servo = new Servo(1);
    telemetryService.register(new ServoMeasurable(clawServo));
}
```

The Third Coast library's `org.strykeforce.telemetry.measurable` package has pre-configured `Measurable` implementations set up for: Canifiers, digital inputs, digital outputs, Pigeon IMUs, power distribution panel, servos, TalonFX, TalonSRX, and ultrasonic rangefinders. Since Talons are so commonly used, we have a convenience method that takes a Talon object directly.

```java
telemetryService.register(talon);
```

## Register Measurable Subsystems

It is very common to want to graph the internal state of a subsystem. It's easy to do using our `MeasurableSubsystem` as the base class for your subsystem. Just override and implement the `getMeasures()` method with your desired measurements.

```java
public class DriveSubsystem extends MeasurableSubsystem {
  // rest of subsystem...

  @Override
  public Set<Measure> getMeasures() {
      return Set.of(
          new Measure("Trajectory Distance", this::getTrajectoryDistance),
          new Measure("Actual Distance", this::getActualDistance),
          new Measure("Robot Yaw Angle", () -> getRobotYawAngle().getDegrees())
      );
  }
}
```

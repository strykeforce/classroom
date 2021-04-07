# Swerve Software{data-background-color="rgb(241, 186, 27)"}

In our robot, we use the WPILIB kinematics suite to convert\
desired velocities to swerve module speed and angle.

## Terminology

Kinematics

: The kinematics classes help convert between a universal `ChassisSpeeds` object, containing linear and angular velocities for a robot to usable speeds for each individual module states (speed and angle) for a swerve drive.

Odometry

: Odometry uses sensors on the robot to create an estimate of the position of the robot on the field. In our robots, these sensors are typically drive and azimuth encoders and a gyroscope to measure robot angle.

: The odometry classes utilize the kinematics classes along with periodic inputs about speeds and angles to create an estimate of the robot’s location on the field.

## the `ChassisSpeeds` Class

The `ChassisSpeeds` object represents the speeds of a robot chassis.

Speeds are given in meters per second.

`vx`
: The velocity of the robot in the **x** (forward) direction.

`vy`
: The velocity of the robot in the **y** (strafe) direction.\
Positive values mean the robot is moving to the left.

`omega`
: The angular velocity of the robot in radians per second.\
Positive is CCW rotation (yaw) of the robot.

```java
var xSpeed = leftJoystick.x * kMaxMetersPerSec;
var ySpeed = leftJoystick.y * kMaxMetersPerSec;
var rotSpeed = rightJoystick.x * kMaxRadiansPerSec;

var speeds = new ChassisSpeeds(xSpeed, ySpeed, rotSpeed);
```

## The `SwerveDriveKinematics` Class

## The `SwerveModuleState` Class

## Swerve Kinematics Examples

We can use the Python version of WPILIB kinematics classes in a Jupyter notebook to easily convert desired robot speed and rotation into swerve wheel speeds and angles.

The classes and concepts are identical to the Java version we use on the robot.

```python
# define some useful constants
MAX_SPEED = 1
MAX_ROTATION = 0.5 * math.pi

# set up the swerve drive kinematics class by specifying where the wheels are
# relative to the center of the robot
fl_loc = Translation2d(0.3, 0.3)
fr_loc = Translation2d(0.3, -0.3)
rl_loc = Translation2d(-0.3, 0.3)
rr_loc = Translation2d(-0.3, -0.3)

kinematics = SwerveDrive4Kinematics(fl_loc, fr_loc, rl_loc, rr_loc)
```

---

### Drive in forward direction

```python
speeds = ChassisSpeeds(MAX_SPEED, 0, 0)
module_states = kinematics.toSwerveModuleStates(speeds)
module_states = kinematics.normalizeWheelSpeeds(module_states, MAX_SPEED)
plot_swerve(wheel_locs, module_states)
```

![swerve 01](img/swerve-software/swerve-01.svg){width=60%}\

---

### Drive in forward, right directions

```python
speeds = ChassisSpeeds(MAX_SPEED, -MAX_SPEED, 0)
module_states = kinematics.toSwerveModuleStates(speeds)
module_states = kinematics.normalizeWheelSpeeds(module_states, MAX_SPEED)
plot_swerve(wheel_locs, module_states)
```

![swerve 02](img/swerve-software/swerve-02.svg){width=60%}\

---

### Drive in forward, right and clockwise directions

```python
speeds = ChassisSpeeds(MAX_SPEED, -MAX_SPEED, -MAX_ROTATION)
module_states = kinematics.toSwerveModuleStates(speeds)
module_states = kinematics.normalizeWheelSpeeds(module_states, MAX_SPEED)
plot_swerve(wheel_locs, module_states)
```

![swerve 03](img/swerve-software/swerve-03.svg){width=60%}\

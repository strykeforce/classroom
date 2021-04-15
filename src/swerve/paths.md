# Trajectory Following{data-background-color="rgb(241, 186, 27)"}

Getting the robot from point A to point B autonomously.

## Why Trajectory Following?

FRC® games often feature autonomous tasks that require a robot to effectively and accurately move from a known starting location to a known scoring location.

During the 2018 season, Stryke Force changed from the "drive-turn-drive" method to trajectory following.

![why trajectory](img/swerve-paths/why-trajectory.svg)\

While more technically challenging, trajectories can be driven much faster since we don't have to stop to change direction.

## Terminology

JSON

: Used for PathWeaver [trajectory export](#pathweaver-trajectory-json), JavaScript Object Notation, is an open standard file format, and data interchange format, that uses human-readable text to store and transmit data objects.

Pose

: A robot's pose is the combination of it's X, Y, and angle (θ) with respect to the field. See the [`Pose2d`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/geometry/Pose2d.html) class.

Trajectory

: A trajectory contains of a collection of [`State`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/trajectory/Trajectory.State.html) points that represent the pose, curvature, time elapsed, velocity, and acceleration at that point. See the [`Trajectory`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/trajectory/Trajectory.html) class.

Waypoint

: Waypoints consists of a X, Y position on the field as well as a robot heading described by a tangent line.

::: notes

- Difference between pose and waypoint angle? Pose is robot yaw, waypoint is direction of travel.

:::

## Starting a PathWeaver Project

When starting a new PathWeaver project, we need to provide season-specific information.

![PathWeaver](img/pathweaver/pathweaver_project.png){width=60%}\

Team up with a mentor to set this up for the first time in a season.

## Creating a Trajectory

The preferred way to create and visualize a path is with the PathWeaver tool.

![PathWeaver](img/pathweaver/pathweaver_ui.png)\

## PathWeaver Tips and Tricks

- Adding additional waypoints and changing their tangent vectors can affect the path that is followed. Additional waypoints can be added by dragging in the middle of the path.
- Fewer is usually better when it comes to waypoints.
- It's sometimes hard to precisely set where the waypoints should be placed. In this case, setting the waypoint locations can be done by entering the X and Y value after selecting the waypoint.
- Path Groups are a way of visualizing where one path ends and the next one starts. By adding all the paths to a single path group and selecting the group, all paths in that group will be shown. Each path can be edited while viewing all the paths.

## Deploy PathWeaver JSON to Robot

Build all paths in the project by clicking the **Build Paths** button.

Configure PathWeaver to output JSON files in **`src/main/deploy/paths`**. Deploying robot code automatically places JSON files on the roboRIO file system in **`/home/lvuser/deploy/paths/output`**.

The PathWeaver JSON can be accessed using `getDeployDirectory`.

```java
String trajectoryJson = "paths/output/YourPath.wpilib.json";
Path trajectoryPath = Filesystem.getDeployDirectory().toPath().resolve(trajectoryJson);
Trajectory trajectory = TrajectoryUtil.fromPathweaverJson(trajectoryPath);
```

\

**Note:** Currently PathWeaver displays the [coordinate system](#coordinate-system) origin at the top left of the field. When building paths, PathWeaver sets the origin at the bottom left in order to be compatible with the [`Field2d`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/smartdashboard/Field2d.html) view in the simulator GUI.

::: notes

Editing the initial waypoint of a path to have X=0.0 and Y=-8.21055 (~27 ft) will build the path with the initial state translation at X=0.0 and Y=0.0.

:::

## Robot Checklist

There are a few things the robot needs before we can actually drive a trajectory.

\

1. Swerve modules and motor controllers configured.
   - Motor controllers settings.
   - Azimuth motor closed-loop tuning.
   - Determine the maximum attainable speed for the robot.
   - Measure drive encoder "distance per pulse".
2. Driver joystick inputs configured.
3. Finish setting up the swerve drive and verify teleop driving. See [`SwerveDriveKinematics`](#the-swervedrivekinematics-class).
4. Determine swerve module drive closed-loop velocity tuning.
5. Configure [`SwerveDriveOdometry`](#the-swervedriveodometry-class).
6. Configure the `HolonomicDriveController`. We'll see this in a later slide.

::: notes

Note that for the WPILib Encoder class, “pulse” refers to a full encoder cycle (i.e. four edges)

:::

## The HolonomicDriveController Class

The [`HolonomicDriveController`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/controller/HolonomicDriveController.html) is used to follow trajectories using a _holonomic_ drive train, such as a swerve or mecanum drive.

The holonomic drive controller takes in one PID controller for each direction, forward and strafe, and one profiled PID controller for the yaw.

Because the yaw dynamics are decoupled from translations, we can can specify a custom yaw heading that the robot should point toward. This heading reference is profiled for smoothness to accomodate yaw setpoint changes.

```java
var xController = new PIDController(kPx, kIx, kDx);
var yController = new PIDController(kPy, kIy, kDy);
var thetaController = new ProfiledPIDController(kPt, kIt, kDt, constraints);
var holonomicDriveController = new HolonomicDriveController​(xController yController, thetaController);
```

## Using Constraints

- optional

## WPILIB

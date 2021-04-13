# Appendix{data-background-color="rgb(241, 186, 27)"}

# PathWeaver Deep Dive{data-background-color="rgb(241, 186, 27)"}

An exploration of how PathWeaver interfaces with WPILIB Trajectory classes.

## PathWeaver Path

We can use PathWeaver to create a trajectory for the robot to drive.

\

![pathweaver screenshot](img/pathweaver/pathweaver_screenshot.png)\

## PathWeaver Path

PathwWaver internally represents this path as a list of **waypoints**.

\

|   X |   Y | Tangent X | Tangent Y | Fixed Theta | Reversed | Name            |
| --: | --: | --------: | --------: | :---------: | :------: | :-------------- |
|   0 |  -2 |         1 |         0 |    true     |  false   | start           |
|   1 |  -1 |         1 |         0 |    false    |  false   | top internal    |
|   2 |  -3 |         1 |         0 |    false    |  false   | bottom internal |
|   3 |  -2 |         1 |         0 |    true     |  false   | end             |

\

They are saved as CSV-formatted data in `*.path` files in a PathWeaver project.

## PathWeaver Waypoints

The important parts of a waypoint are its coordinates and the length and direction of its **tangent vector**. We denote the tangent vector with its tail at the waypoint coordinates and its head at tangent x, y.

![waypoint](img/swerve-paths/waypoint.svg)\

## Waypoint to Trajectory Conversion

This [code excerpt](https://github.com/wpilibsuite/PathWeaver/blob/5e8ea0cafca829eeb10aa55ba70542022b6102da/src/main/java/edu/wpi/first/pathweaver/spline/wpilib/WpilibSpline.java#L172) from PathWeaver illustrates how it converts a list of waypoints to a trajectory.

```java
private static Trajectory trajectoryFromWaypoints(Iterable<Waypoint> waypoints, TrajectoryConfig config) {
    var list = new TrajectoryGenerator.ControlVectorList();
    for(Waypoint wp: waypoints) {
        list.add(new Spline.ControlVector(
                new double[] {wp.getX(), wp.getTangentX(), 0},
                new double[] {wp.getY(), wp.getTangentY(), 0}));
    }

    return TrajectoryGenerator.generateTrajectory(list, config);
}
```

### But what's really happening?

## Trajectories are Connected Splines

A trajectory is made up of one or more connected **splines**, each defined by end points and the slope at the end points. The end points of each spline are given by two consecutive waypoints from PathWeaver.

![splines](img/pathweaver/splines_1.svg){width=100%}\

---

You can connect together as many splines as you need to complete a trajectory.

Here we show the three splines generated from the four PathWeaver waypoints in our earlier example.

![splines](img/pathweaver/splines_2.svg){width=100%}\

::: notes
N waypoints will product N-1 splines.
:::

## Spline Parameterization

The [`SplineParameterizer`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/spline/SplineParameterizer.html) ([source](https://github.com/wpilibsuite/allwpilib/blob/948625de9d40068133adf9b39310055e6521b9c0/wpimath/src/main/java/edu/wpi/first/wpilibj/spline/SplineParameterizer.java)) class breaks up the spline into various arcs until their dx, dy, and dθ are within specific tolerances.

Each dot on the right plot is a [`PoseWithCurvature`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/spline/PoseWithCurvature.html).

![parameterized spline](img/pathweaver/spline-parameterized.svg){width=100%}\

::: notes
This works by checking the whole spline dx, dy and dθ, and then "recursively" splitting spline in half, rechecking each until limits are met.

velocities are planned for these points and constant acceleration/deceleration is assumed between them.
:::

---

We calculate the points for each spline and then append them together to produce the `PoseWithCurvature` points for the entire trajectory.

![parameterized splines](img/pathweaver/splines-parameterized.svg){width=100%}\

At this point, spline parameterization has given us the **x, y** coordinates and the **direction** of travel ([`Pose2d`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/geometry/Pose2d.html)) for each trajectory point.

## Trajectory Parameterization

After spline parameterization has broken up our trajectory into manageable segments, we next need to calculate the velocity profile.

The velocity profile is, for each trajectory point, the **time** that point is reached, and the **velocity** and **acceleration** at that point. This calculation is called trajectory parameterization.

This is calculated by the [`TrajectoryParameterizer`](https://first.wpi.edu/wpilib/allwpilib/docs/release/java/edu/wpi/first/wpilibj/trajectory/TrajectoryParameterizer.html) class.

\

When you combine this with the **position** and **travel direction** of each trajectory point given by spline parameterization, we have all the information we need for the robot to drive the trajectory. (Spline parameterization also give us **curvature** at each trajectory point.)

---

The `TrajectoryParameterizer` class calculates the final trajectory points.

\

1. The distance between trajectory point B and the previous point A is calculated.
2. The velocity at B is calculated from the velocity at A, the maximum acceleration, and the distance travelled. $v_B = \sqrt{v_A^2 +2ad}$

   Clamp this to the maximum velocity if neccessary.

3. Apply trajectory constraints to maximum acceleration and velocity at point B.
4. Calculate the actual acceleration from the velocity at A, the constrained velocity at B, and the distance travelled. $a = \frac{v_B^2 - v_A^2}{2d}$

5. If actual acceleration exceeds the constrained acceleration for B, assign B's constrained acceleration to A and loop back to start again.
6. If actual acceleration is less than constrained acceleration for B, we are done! Go to next point and repeat.
7. When finished in the forward direction, go through this same entire process backwards through the list of points to make sure we don't exceed maximum decceleration.

::: notes

- We may need to iterate to find the maximum end velocity and common acceleration, since acceleration limits may be a function of velocity.
- Enforce global max velocity and max reachable velocity by global acceleration limit.
- If the actual acceleration for this state is higher than the max acceleration that we applied, then we need to reduce the max acceleration of the predecessor and try again.
- If the actual acceleration is less than the predecessor's min acceleration, it will be repaired in the backward pass.

:::

## Curvature

A quick detour into terminology — what is curvature?

![curvature](img/swerve-paths/curvature.svg){width=70%}\

Curvature is primarily uses to **constrain** our trajectory velocity and acceleration profile as needed, for example to prevent the robot from tipping in a tight turn.

::: notes

Intuitively, the curvature describes for any part of a curve how much the curve direction changes over a small distance travelled, so it is a measure of the instantaneous rate of change of direction of a point that moves on the curve: the larger the curvature, the larger this rate of change.
[Wikipedia](https://en.wikipedia.org/wiki/Curvature)

:::

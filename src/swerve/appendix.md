# Appendix{data-background-color="rgb(241, 186, 27)"}

# Pathweaver Deep Dive{data-background-color="rgb(241, 186, 27)"}

A survey of how Pathweaver interfaces with WPILIB Trajectory classes.

## Pathweaver Path

We can use Pathweaver to create a trajectory for the robot to drive.

\

![pathweaver screenshot](img/pathweaver/pathweaver_screenshot.png)\

## Pathweaver Path

Pathweaver internally represents this path as a list of **waypoints**.

\

|   X |   Y | Tangent X | Tangent Y | Fixed Theta | Reversed | Name            |
| --: | --: | --------: | --------: | :---------: | :------: | :-------------- |
|   0 |  -2 |         1 |         0 |    true     |  false   | start           |
|   1 |  -1 |         1 |         0 |    false    |  false   | top internal    |
|   2 |  -3 |         1 |         0 |    false    |  false   | bottom internal |
|   3 |  -2 |         1 |         0 |    true     |  false   | end             |

\

They are saved as CSV-formatted data in `*.path` files in a Pathfinder project.

## Pathfinder Waypoints

The important parts of a waypoint are its coordinates and the length and direction of its **tangent vector**. We denote the tangent vector with its tail at the waypoint coordinates and its head at tangent x, y.

![waypoint](img/swerve-paths/waypoint.svg)\

## Trajectories are Splines

A trajectory is made up of one or more connected **splines**, each defined by end points and the slope at the end points. The end points of each spline are given by two consecutive waypoints from Pathfinder.

![splines](img/pathweaver/splines_1.svg){width=100%}\

---

Here we show the three splines generated from Pathfinder waypoints in our first example.

![splines](img/pathweaver/splines_2.svg){width=100%}\

## Waypoint to Trajectory Conversion

This code excerpt from Pathfinder illustrates how it converts a list of waypoints to a list of spline control vectors and uses these splines to generate a trajectory.

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

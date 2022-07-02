# Welcome to SkyBattle

SkyBattle is a programming game. You have to write the code to program a robot fighting agaist another robot.

The engine runs in Kubernetes or in Docker, and every robot controller is a micro-service running in Kubernetes.

You need either a Kubernetes cluster or a local Docker instance.

Download and unpack the distribution appropriate for you operating system and architecture.

If you have a local Docker Desktop you need to setup Nuvolaris with:

```
./nuv setup --devcluster
````

then you can install SkyBattle.  You need two steps.

First, you have to set the environment variable with a password to access it. Use:

```
# command for Mac and Linux
export SECRET=<your-password>
# command for Windows CMD,exe
set SECRET=<your-password>
```

Then install skybattle with:

```
./nuv project deploy
```

Finally get the url with 


```
./nuv url skybattle
```

Go to that url and start playing.

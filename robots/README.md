# Welcome to Microbots


MicroBots is a programming game. You have to write a micro-service to control a robot fighting agaist another robot.

The engine runs either in Docker on in Kubernetes.

## Installation

Download and unpack the distribution appropriate for you operating system and architecture.

Now you have to set the environment variable with a password to access it. Use:

```
# command for Mac and Linux
export SECRET=<your-password>
# command for Windows CMD,exe
set SECRET=<your-password>
```

If you have a local Docker Desktop you can now setup Nuvolaris and Deploy Microbots with:

```
./nuv setup --devcluster
````

If instead you have a Kubernetes configured with Kubectl that also supports a Load Balancer, use:

```
./nuv setup --context=<context> --apihost=auto
```

You can use `./nuv setup` to discover the name of your context if you have only one.


It will take a while but in the end Microbots will be deployed.

You can get the url to access the Battlefield it with:

```
./nuv url microbots
```

Open the shown url, use your password to access it and code your robots.
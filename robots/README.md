# Welcome to Microbots


MicroBots is a programming game. You have to write a micro-service to control a robot. Your robot will fight agaist another robot. Instructions how to code your robot are included in the game.

## Installation

The engine runs either in Docker on in Kubernetes.

Download and unpack the distribution appropriate for you operating system and architecture.

Releases are here: https://github.com/nuvolaris/microbots/releases/

Before installing,  you have to set an environment variable with the password to access it. 

If you are on Mac or Linux use:

```
export SECRET=<your-password>
```

If you use Windows, use:

```
set SECRET=<your-password>
```

Now you can install it.

--- 

If you have a local Docker Desktop, you can install with

```
./nuv setup --devcluster
````

If you have a a Kubernetes configured with Kubectl that also supports a Load Balancer, use:

```
./nuv setup --context=<context> --apihost=auto
```

You can use `./nuv setup` to discover the name of your context if you have only one.

There are many other options to install . Check get.nuvolaris.io for more informations.

---

After you launched the installer,  it will take a while but in the end Microbots will be deployed.

You can get the url to access the Battlefield it with:

```
./nuv url microbots
```

Open the shown url, click on Login, use your password to access it and you can code your robots.

Enjoy the battle!

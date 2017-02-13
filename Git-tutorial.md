## Basic Git Workflow

Git is a distributed version control software that was originally designed to 
handle large scale distributed software projects like the Linux kernel. If you
are farmiliar with Apple computers, git acts similar to TimeMachine on your mac.
It allows the developer to save previous states of a project, and revert to any 
one of these states at will. The main idea is instead of panicing when your new 
function breaks your program you just go back to the last working state and fix 
your problem from there. 

Git is a very powerful tool, and the above description does not begin to touch
all of the features git has to offer. The truth of the matter is most of the 
time you will only use **$(some number)** main commands. Those commands are the ones
I will cover here.

Git is actually just a commandline tool, but the website [github][1] has made a
fantastic ecosystem around this tool. I will be framing this tutorial around 
the idea that you are using [github][1] to host your project. I will 
also go into some of the features [github][1] provides for project management.
This tutorial assumes you already have a working [github][1] account up and 
running, and are aware how to start a new repo on the page. So without further 
adieu, let's get started.


### *Here's the story.*

You just started the hot new task manager app and you decided to host it on 
[github][1]. You already created the repo and invited all your teammates as 
collaberators. Now it's time to get that repo on your computer and start 
working.

#### Step One: install git
If you are using linux simply use your package manager to install git. For
example, on an Ubuntu box simply type:

```
sudo apt-get update && sudo apt-get install git
```

For you mac people there will be a short commercial break for [homebrew][2].
Home brew is the package manager that Apple never made. To install homebrew go
[here][2] and simply follow the instructions. You may get a prompt saying you 
need to install some Xcode stuff. That is from Apple it is safe. Do what your 
computer tell you to do. After homebrew is installed type

```
brew install git
```

in your terminal and homebrew will take care of the rest. If you ever want to 
uninstall git (which you never should) simply type

```
brew uninstall git
```

and it will be gone.

#### Step Two: clone the repo
Now, you want to get that repo onto you local computer. You will need the URL of
the repo on github. Navigate to de-crast's base page on git hub and copy the 
URL. then you will use git's **clone** command to make a copy of the repo on 
your local machine. ```cd``` into where you want de-crast to live and type the
following command into your terminal.

```
git clone https://github.com/jeremyCloud/de-crast
```

Now, you will have a new folder in your current dir called cd-crast with all
the stuff that was on the website.

#### Step Three: create a new branch
Branches are gits way of organizing your project into independant 
non-conflicting ... branches. Each new git project is created with a default
branch called ```master```. **Do not do work on master**. When you create a new
branch, you essentailly make a copy of the project that you can comfortably edit
and change without altering the original code. This allows you to experiment on
features that may break the program in a safe way that does not risk breaking 
the project as a whole.

Let's say I want to add a little README document about myself. 

 1. create a new branch.
    
    ```
    git branch README_jeremy
    ```

 2. tell git to switch to that new branch.

    ```
    git checkout README_jeremy
    ```

 3. go crazy!

    ```
    echo "My name is Jeremy and I am learning git!" > REAME_jeremy
    ```
 
 4. calm down. We just added a file to our git repo. Now, we need to tell git 
    about it.

    ```
    git add README_jeremy
    ```
 
 5. Lets check the status of our repo.
    
    ```
    git status
    ```

 6. 





[1]: https://github.com
[2]: https://brew.sh 


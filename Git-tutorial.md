## Basic Git Workflow

Git is a distributed version control software that was originally designed to 
handle large scale distributed software projects like the Linux kernel. If you
are familiar with Apple computers, git acts similar to TimeMachine on your mac.
It allows the developer to save previous states of a project, and revert to any 
one of these states at will. The main idea is instead of panicking when your new 
function breaks your program you just go back to the last working state and fix 
your problem from there. 

Git is a very powerful tool, and the above description does not begin to touch
all of the features git has to offer. The truth of the matter is most of the 
time you will only use **7** main commands. Those commands are the ones
I will cover here.

Git is actually just a command line tool, but the website [GitHub][1] has made a
fantastic ecosystem around this tool. I will be framing this tutorial around 
the idea that you are using [GitHub][1] to host your project. I will 
also go into some of the features [GitHub][1] provides for project management.
This tutorial assumes you already have a working [GitHub][1] account up and 
running, and are aware how to start a new repo on the page. So without further 
adieu, let's get started.


### *Here's the story.*

You just started the hot new task manager app and you decided to host it on 
[GitHub][1]. You already created the repo and invited all your teammates as 
collaborators. Now it's time to get that repo on your computer and start 
working.

#### Step One: install git
If you are using Linux simply use your package manager to install git. For
example, on an Ubuntu box simply type:

```
sudo apt-get update && sudo apt-get install git
```

For you mac people there will be a short commercial break for [homebrew][2].
Home brew is the package manager that Apple never made. To install homebrew go
[here][2] and simply follow the instructions. You may get a prompt saying you 
need to install some Xcode stuff. That is from Apple it is safe. Do what your 
computer tells you to do. After homebrew is installed type

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
the repo on GitHub. Navigate to de-crast's base page on git hub and copy the 
URL. then you will use git's **clone** command to make a copy of the repo on 
your local machine. ```cd``` into where you want de-crast to live and type the
following command into your terminal.

```
git clone https://github.com/jeremyCloud/de-crast
```

Now, you will have a new folder in your current dir called cd-crast with all
the stuff that was on the website.

#### Step Three: branches 
Branches are gits way of organizing your project into independent 
non-conflicting ... branches. Each new git project is created with a default
branch called ```master```. **Do not do work on master**. When you create a new
branch, you essentially make a copy of the project that you can comfortably edit
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
    echo "My name is Jeremy and I am learning git!" > README_jeremy
    ```

#### Step Four: commiting our changes
 1. Calm down. We just added a file to our git repo. Now, we need to tell git about 
    it.

    ```
    git add README_jeremy
    ```
 
 2. Lets check the status of our repo.
    
    ```
    git status
    ```

 3. Everything looks good let's ```commit``` (save) those changes.
    
    ```
    git commit
    ```

    here git will bring up a text editor and ask you for a short message about
    what you are committing. We can change the above command to avoid the text
    editor like so,

    ```
    git commit -m "This is a short README document about me!"
    ```

#### Step Five: updateing Github
 1. Now, we have our local repo up to date with all our new fancy changes. Now 
    we need to push our local changes up to GitHub. 

    ```
    git push origin README_jeremy
    ```

    if we break down that command we our pushing our local branch 
    (README_jeremy) to this repo's origin (GitHub).

#### Step Six: pull requests
That was easy right? I think we earned a little break from the command line.
Head on back to the project's GitHub page. You should see your branch name
highlighted above the repo's file explorer. If you are done with your 
branch, and you are ready for your changes to be incorporated into the 
master branch, go ahead and press the "compare and pull request" next to 
your branch.

Go ahead and leave a small description of your branch for others to see. 
When you are finished press the "Create pull request" button.

We are almost done. At this point GitHub does something fun. If your file 
conflicts with something in "master" GitHub lets us view and fix and 
conflicts. It also gives us a little place to talk about the code as a 
group before it is added to the master branch. Once we agree that it is 
safe and good to merge the branch all we have to do is press "merge pull 
request".

#### Step Seven: git pull
Do not confuse this stem with pull requests. Pull requests are handled on
Github. The command ```git pull``` is used to update your local repo to 
any changes that are on Github. Similar to how ```git push``` is used to
update Github when you have local changes, ```git pull``` is used to
update your local copy when there are changes remotely.

Be careful with ```git pull```. If you have changes locally and you pull
from Github, there is a possibility your local changes may get 
overwritten. It is a good idea to always ```git commit``` before you
```git pull```. This way if there is any issue you can always checkout
your last commit and recover all your old work.

#### That's It!
We did it. Or rather you did. You made it through my long ass rambling document.
congratulations. This is not even close to everything that git is capable of. 
I hope you have a better idea about how it works. Just remember...

 1. ```git clone https://github.com/username/myrepo```
 2. ```git branch some-branch-name```
 3. ```git checkout some-branch-name```
 4. ```git add file1 file2 ...```
 5. ```git commit -m "some message"```
 6. ```git push origin some-branch-name```
 7. submit a pull request on github
 8. review pull request
 9. merge pull request
 10. ```git pull```

It's easy... or Google it ;)

[git documentation][3]

## *Fin*


[1]: https://github.com
[2]: https://brew.sh 
[3]: https://git-scm.com/documentation

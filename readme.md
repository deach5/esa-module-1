# TLH Base HTML Package

## Setup build environment

First you need to ensure you have npm installed on your local machine. To check, open up a command shell and run the following:

```
npm
```

If you get an output of how to use the command, then you have it installed. If not, then go to [Node.js' website](https://nodejs.org) to find how to install it for your system.

Next you will need to clone this repo to your local machine using your preferred git client (ie Sourcetree, Sublime Merge, or just the plain ol' git command).

Then open the cloned repo in a command shell and run the following command:

```
npm install
```

This will install all the required npm packages listed in the `package.json` file.

## Build js + scss

Currently there are two [npm scripts](https://docs.npmjs.com/misc/scripts) setup in `package.json` which allow you to build the scripts and styles for the package.

### js

To build the package's javascript you run the following command in a command shell:

```
npm run js
```

This will build the `js/functions.js` file into `js/functions.min.js` and will bake in any to the imported scripts using [rollup](https://rollupjs.org/). Be sure to never include the built `js/functions.min.js` file in any commits (it is in `.gitignore` so it should be automatic), but conversely, you need to be sure it gets included when deploy it to a site or when you zip up the package for delivery to the client.

### scss

To build the package's styles you run the following command in a command shell:

```
npm run scss
```

This compiles the `scss/styles.scss` file into `css/styles.css`. Be sure to never include the built `css/styles.css` file in any commits (it is in `.gitignore` so it should be automatic), but conversely, you need to be sure it gets included when deploy it to a site or when you zip up the package for delivery to the client.

## Working with Packages

This repo is meant to be a base from which actual packages are created, any package-specific changes will need to be done in separate repos which are branched (or forked) off this one.

This section will go through how to create those packages and how to keep them up to date with changes done to this repo.

### Creating a new package

To create a new package from this base, you first need to fork this repo in bitbucket.

* Login to [gitlab](https://git.com)
* Go to this repo: https://gitlab.com/learninghook/tlh/tlh-base-html-package
* In the left menu, press the Create button (plus icon)
* At the bottom, select "**Fork** this repository"
* On the create fork screen:
    * Ensure you select "TLH_internal" from the Owner dropdown.
    * Select the correct project (or create a new one)
    * And give it an appropriate name (TODO: document naming convention)
    * Leave the rest as is and select "Fork repository" to complete

Now you have a new repo which is a copy of this one which you can make your required package-specific changes in.

### Keeping a package up to date

Since this repo will be updated regularly with bugfixes and feature changes which are not package-specific, it is good to ensure that those changes also get applied to any packages created from it.

To do this, you will first need to ensure that this repo is setup as a remote in your local copy of the package repo. To find out more on what remotes are, please consult [the official docs on the subject](https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches).

Since git clients handle remotes quite differently, the examples below show how to manage remotes using the git shell command.

First add this repo as a remote named base-html (or any other name you wish to give it):

```
git remote add base-html git@gitlab.com:learninghook/tlh/tlh-base-html-package.git
```

Then fetch the repo's history so know what changes have been made since the package was forked:

```
git fetch base-html
```

And then (if you want) you can merge in any of the changes made:

```
git merge base-html master
```

The above command merges the base-html remote's master branch into your currently checked out branch.

A shorthand for the fetch and merge commands is the pull command, which does both in succession. It should be used sparingly here though, since it is always good to review the changes made in case there are any issues.

This does the same as the two previous examples combined:

```
git pull base-html master
```

Also, be sure to never push to the `base-html` remote, since that will push all the package-specific changes to the base repo and create a mess!

Parse.com Datasucker
====================

In addition to providing the [Required API](https://github.com/datasucker/netrunner-datasucker#required-api), this Parse.com Datasucker offers some helpful utilities to easily configure your Datasucker:
- Clone other Datasuckers (preferred)
- Pull data directly from CGDB (fallback method)
- Daily background Job (via Parse.com) to automatically clone / update the database


#### Setup and Configuration Overview
Here's a quick overview of the major steps in the process:

1. Create a free Parse.com Developer Account
  * If you want to be *discreet*, this is the place to do it
2. Create a **Cloud Code** App
  * Name it whatever you want
  * Skip the instructions process
3. Give your App a subdomain name in the settings area
  * The more obtuse the better
4. Install Parse.com Command Line Tools (see their instructions)
5. `parse new <AppName>`
  * It will ask for your user / pass from earlier and to select the App you created
6. Copy the contents of the `Parse` direction to the folder created by the Parse tool
7. `parse deploy`
  * Do this inside the directory created by `parse new <AppName>`
8. In the Parse.com control panel, schedule a Daily Background Job for `refreshData` (pick a random time)
9. **Important:** Immediately visit your Datasucker's web UI: `https://<subdomain>.parseapp.com`
10. Configure the Datasucker's Access Code through the web UI.
  * This password is strored securely and the app should be enforcing HTTPS
11. Enter the Lockpick Key of the Datasucker you want to clone (recommended, optional)
12. Save Settings
13. Go to the Parse.com control panel and manually run your Background Job to populate the databse.

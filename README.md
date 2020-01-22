### About
Web-autologin-script.user.js automatically fills the username and password fields.
How it works is described in the script itself in the comments.

In my case:
At work, I have a couple of hundred devices that can be managed via the web interface, quite often I have to login to them. 
I’m just tired of constantly entering the username and password on each device, so I wrote this script.

### Instructions
##### Installation through https://openuserjs.org/
1. Download and install Tampermonkey for your browser.
2. Open the link and click on the Install button on the site.
3. Set [settings](#settings).

##### Manual installation
1. Download and install Tampermonkey for your browser.
2. Download web-autologin-script.user.js, open and set your [settings](#settings).

##### Settings
My devices work with http, if you need, you can enable https, add to // ==UserScript==
```
// @match        http://*/*
// @match        https://*/*
```

```javascript
    // SETTINGS
    // If true, script will click on a login button.
    // If false, just fills fields.
    const AUTOLOGIN = false;
    // Enable logs?
    const LOGS = false;
    // How long to wait before the script starts. Set milliseconds.
    const WAIT = 2000;
    // A script will run if the IP address of device is in one of this subnets. | Add your own subnets.
    const SUBNETS = ["192.168.192.0/24", "172.16.0.0/8"];
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with password field.
    const PASSWORDS = ["textpass", "pinkpanther", "Password", "password"];
        // Some devices don't have the login field. For example: DES-1100-16.
        const PASSWDS = ["pass", "passwd"]
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with login field.
    const LOGINS = ["textuser", "pelican", "Login", "username"];
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with submit button.
    const SUBMITS = ["Login", "OK", "login_ok"];
    // Authorization data for devices.
    const LOGIN = '';
    const PASSWORD = '';
```

### FAQ
* I want the login button to be pressed automatically too.

  Just change the value of the variable AUTOLOGIN to true.
  ```javascript
  const AUTOLOGIN = true;
  ```

* The script doesn't work with my device.
  
  Enable logs to console, change to
  ```javascript
  const LOGS = true;  
  ```
  Open the console panel(chrome shortkey: Control+Shift+J),
  and look at the messages, if the script didn't work, probably it will say what the problem is.

  Most likely it didn't find an attribute for a password/username/submit button field.

  Just find attributes for your device with HTML inspector(Control+Shift+I) 
  and add them into variables [PASSWORDS/LOGINS/SUBMITS].
  ```javascript
    const PASSWORDS = ["textpass", "pinkpanther", "Password", "password"];
      // For devices that don't have username field.
      const PASSWDS = ["pass", "passwd"]
    const LOGINS = ["textuser", "pelican", "Login", "username"];
    const SUBMITS = ["Login", "OK", "login_ok"];
  ```

P.S.
This is my first experience with javascript, don't hate me if it looks wrong, better tell me what is wrong.

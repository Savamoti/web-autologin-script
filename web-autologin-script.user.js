// ==UserScript==
// @name         web-autologin-script
// @license      MIT
// @homepageURL  https://github.com/Savamoti/web-autologin-script
// @supportURL   https://github.com/Savamoti/web-autologin-script/issues
// @updateURL    https://github.com/Savamoti/web-autologin-script/releases/latest/download/web-autologin-script.user.js
// @version      1.0
// @description  The script automatically fills the username and password fields.
// @author       Savamoti
// @match        http://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    /*
        What is that?
    A script that automatically fills a username and password fields,
    if you set AUTOLOGIN = true, it will also click on the login button.

        Works on:
    Ubiquiti devices:
        NanoStation loco M2
        NanoStation 2
        PowerBeam M2 400
        NanoBridge M2
        NanoStation loco M2
        etc.
    Rybetech:
        FGS-2924R
        ES-2226C
        ES-2410C
        ES-2126C
        GS-2124C
        ES-2310C
    D-Link:
        DES-1100-16
        DES-2108
        DGS-1100-10/ME
        DES-1210-26/ME
        DES-1210-28/ME
        DGS-1210-12TS/ME
        DGS-1100-06/ME

        How it works?
        In comments below..
    */

    // SETTINGS
    // If true, script will click on a login button.
    // If false, just fills fields.
    const AUTOLOGIN = false;
    // Enable logs?
    const LOGS = true;
    // How long to wait before the script starts. Set milliseconds.
    const WAIT = 2000;
    // A script will run if the IP address of device is in one of this subnets. | Add your own subnets.
    const SUBNETS = ["192.168.192.0/24", "172.16.0.0/8"];
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with password field.
    const PASSWORDS = ["textpass", "pinkpanther", "Password", "password"];
        // For devices that don't have username field.. For example: DES-1100-16.
        const PASSWDS = ["pass", "passwd"]
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with login field.
    const LOGINS = ["textuser", "pelican", "Login", "username"];
    // The attributes of the tag Input(you can add NAME or ID or VALUE), which is associated with submit button.
    const SUBMITS = ["Login", "OK", "login_ok"];
    // Authorization data for devices.
    const LOGIN = '';
    const PASSWORD = '';

    // FUNCTIONS
    function log (message) {
        if (LOGS) {
            console.log(message);
        }
    };

    function isIpValid(ip) {
        let match_status
        // match only IP, range 0.0.0.0-255.255.255.255
        match_status = ip.match(/^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/mg);
        if (match_status) {
            return true;
        };
        return false;
    };

    function IPtoInt(ip){
        // expect: string(IP like "192.168.1.1")
        // return: int
        let ipl = 0;
        ip.split('.').forEach(function(octet) {
            ipl <<= 8;
            ipl += parseInt(octet);
        });
        return(ipl >>> 0);
    };

    function isIPinSubnet(ip, subnet) {
        // expect: 2 string [For example: "192.168.1.1", "192.168.1.0/24"]
        let int_ip = IPtoInt(ip);
        let base_ip;
        let mask;
        // match "192.168.1.0/24" > (3) ["192.168.1.0/24", "192.168.1.0", "24"]
        if ((mask = subnet.match(/^(.*?)\/(\d{1,2})$/)) && ((base_ip=IPtoInt(mask[1])) >= 0)){
            base_ip = base_ip.toString(2);
            let left_mask = 32 - mask[2];
            // find minimum IP 192.168.1.0 255.255.255.0
            let start_ip = parseInt(base_ip.slice(0, mask[2]) + "0".repeat(left_mask), 2);
            // find maximum IP 192.168.1.255 255.255.255.0
            let end_ip = parseInt(base_ip.slice(0, mask[2]) + "1".repeat(left_mask), 2);
            return (int_ip >= start_ip) && (int_ip <= end_ip);
        } else {
            return false;
        };
    };

    function findPassword(attribute) {
        // expect: string [name/id/value]
        // return: object [contain HTML tag with attributes]
        let tags;
        let tag;
        if (document.querySelector('input[type=password]')) {
            // transform the collection into an array
            tags = document.querySelectorAll('input[type=password]')
            tags = Array.prototype.slice.call(tags);
            for (tag in tags) {
                if (tags[tag].name == attribute) {
                    return tags[tag];
                };
                if (tags[tag].id == attribute) {
                    return tags[tag];
                };
                if (tags[tag].value == attribute) {
                    return tags[tag];
                };
            };
        } else {
            return false;
        };
    };

    function findLogin(attribute) {
        // expect: string [name/id/value]
        // return: object [contain HTML tag with attributes]
        let tags;
        let tag;
        if (document.querySelector('input[type=text]')) {
            // transform the collection into an array
            tags = document.querySelectorAll('input[type=text]')
            tags = Array.prototype.slice.call(tags);
            for (tag in tags) {
                if (tags[tag].name == attribute) {
                    return tags[tag];
                };
                if (tags[tag].id == attribute) {
                    return tags[tag];
                };
                if (tags[tag].value == attribute) {
                    return tags[tag];
                };
            };
        } else {
            return false;
        };
    };

    function findSubmit(attribute) {
        // expect: string [name/id/value]
        // return: object [contain HTML tag with attributes]
        let tags;
        let tag;
        if (document.querySelector('input[type=submit]')) {
            // transform the collection into an array
            tags = document.querySelectorAll('input[type=submit]')
            tags = Array.prototype.slice.call(tags);
            for (tag in tags) {
                if (tags[tag].name == attribute) {
                    return tags[tag];
                };
                if (tags[tag].id == attribute) {
                    return tags[tag];
                };
                if (tags[tag].value == attribute) {
                    return tags[tag];
                };
            };
        } else if (document.querySelector('input[type=button]')) {
            tags = document.querySelectorAll('input[type=button]')
            tags = Array.prototype.slice.call(tags);
            for (tag in tags) {
                if (tags[tag].name == attribute) {
                    return tags[tag];
                };
                if (tags[tag].id == attribute) {
                    return tags[tag];
                };
                if (tags[tag].value == attribute) {
                    return tags[tag];
                };
            };
        } else if (document.querySelector('button')) {
            tags = document.querySelectorAll('button')
            tags = Array.prototype.slice.call(tags);
            for (tag in tags) {
                if (tags[tag].name == attribute) {
                    return tags[tag];
                };
                if (tags[tag].id == attribute) {
                    return tags[tag];
                };
                if (tags[tag].value == attribute) {
                    return tags[tag];
                };
            };
        } else {
            return false;
        };
    };

    function main(ip) {
        if (!isIpValid(ip)) {
            log("ERROR: IP is not valid.");
            return false;
        };
        let subnet;
        for (subnet in SUBNETS) {
            if (isIPinSubnet(ip, SUBNETS[subnet])) {
                let password_attr;
                for (password_attr in PASSWORDS) {
                    if (password_attr = findPassword(PASSWORDS[password_attr])) {
                        password_attr.value = PASSWORD;
                        let login_attr;
                        for (login_attr in LOGINS) {
                            if (login_attr = findLogin(LOGINS[login_attr])) {
                                login_attr.value = LOGIN;
                                if (AUTOLOGIN) {
                                    let submit_attr;
                                    for (submit_attr in SUBMITS) {
                                        if (submit_attr = findSubmit(SUBMITS[submit_attr])) {
                                            submit_attr.click();
                                            log("INFO: Log in success.");
                                            return true;
                                        };
                                    };
                                    log("ERROR: Attribute(name, id, value) for submit button not found in SUBMITS array." +
                                                " Add new attribute to match submit button.");
                                    return false;
                                } else {
                                    log("INFO: LOGIN and PASSWORD are set, but AUTOLOGIN disabled.")
                                    return true;
                                };
                            };
                        };
                        log("ERROR: Attribute(name, id, value) for login field not found in LOGINS array." +
                                    " Add new attribute to match login input.");
                        return false;
                    };
                };
                // Device that don't have login field.
                for (password_attr in PASSWDS) {
                    if (password_attr = findPassword(PASSWDS[password_attr])) {
                        password_attr.value = PASSWORD;
                        if (AUTOLOGIN) {
                            let submit_attr;
                            for (submit_attr in SUBMITS) {
                                if (submit_attr = findSubmit(SUBMITS[submit_attr])) {
                                    submit_attr.click();
                                    log("INFO: Log in success.");
                                    return true;
                                };
                            };
                            log("ERROR: Attribute(name, id, value) for submit button not found in SUBMITS array." +
                                        " Add new attribute to match submit button.");
                            return false;
                        } else {
                            log("INFO: LOGIN and PASSWORD are set, but AUTOLOGIN disabled.")
                            return true;
                        };
                    };
                };
                log("ERROR: Attribute(name, id, value) for password field not found in PASSWDS array." +
                            " Add new attribute to match password input.");
                return false;
            };
        };
        log("ERROR: IP not found in SUBNETS.");
        return false;
    };

    // MAIN
    const IP = location.host;
    // Run after timeout.
    setTimeout(main, WAIT, IP);
})();

# auff

A mobile client for [2FAuth](https://2fauth.app), made with React Native, React Native Paper and <3


> [!NOTE]
> The app is early in development, so not all features are implemented yet, and those that are may not work as you expect! If you find a bug, please report it!

<p>
  <img alt="Home screen" src="https://raw.githubusercontent.com/powermaker450/auff/refs/heads/main/repo/home.png" width="200">
  <img alt="Authentication code screen" src="https://raw.githubusercontent.com/powermaker450/auff/refs/heads/main/repo/code.png" width="200">
  <img alt="Settings screen" src="https://raw.githubusercontent.com/powermaker450/auff/refs/heads/main/repo/settings.png" width="200">
</p>

I like that my 2-factor authentication codes are on a web interface that I can easily reach wherever I go. I also wanted the added convienience of an offline, persistently logged-in mobile app that I could quickly copy codes from, even on a spotty connection.

## Installation
- If you already have a self-hosted 2FAuth server, make sure to grab an [access token](https://docs.2fauth.app/api/#authentication) for your account as you'll need it to sign in.
- Head over to the [releases](https://github.com/powermaker450/auff/releases) tab for now to grab the latest version of the app, for Android only currently. Uploading a release on the major app stores is planned.

## Features
- View and copy your existing 2-factor authentication codes
- Codes are synced from the server whenever the app is online
- Secure the app with your biometrics option, if desired

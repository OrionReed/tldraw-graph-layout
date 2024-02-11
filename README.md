This repository shows how you might use [tldraw](https://github.com/tldraw/tldraw) together with the [yjs](https://yjs.dev) library. It also makes a good example for how to use tldraw with other backend services!

This branch shows a partykit integration.

For production:

- First create a `.env` file with:

```
VITE_PRODUCTION_URL=https://tldraw-partykit-yjs-example.YOUR_USERNAME.partykit.dev
```

...replacing `YOUR_USERNAME` with your partykit username.

- Then run `yarn deploy`

If it's your first time using partykit, you may need to try deploying first in order to get your username. While the instructions above should work, the real way to do this is to point the `VITE_PRODUCTION_URL` at whatever URL you're deploying the website to.

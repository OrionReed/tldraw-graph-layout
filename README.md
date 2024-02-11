# tldraw graph layout
This repo demonstrates an interactive force-directed graph layout integration with [tldraw](https://github.com/tldraw/tldraw). It uses [WebCola](https://ialab.it.monash.edu/webcola/) (A JS port of [libcola](http://www.adaptagrams.org) from [Time Dwyer](https://ialab.it.monash.edu/~dwyer/) and others)

## Setup
```bash
yarn install
yarn dev
```
Then go to `http://localhost:5173` in your browser.

Multiplayer is supported* using yjs and partykit. To deploy:
```bash
yarn deploy
```

*Note that this is a _terrible_ way to do multiplayer and there is no handling for multiple clients with overlapping graph layout sims. It's essentially the same as a single client manually moving many shapes each frame, but it sure is fun! If you find it's stalling on "Connecting..." you can disable multipayer by commenting out line 22 in App.tsx (store={store}). PRs for multiplayer fixes are **very** welcome!

## Usage
1. Select shapes you wish to include in the physics simulation
2. Click the "Graph" button (or hit "G")
3. Move shapes around and watch it go brrrrrrrrrr
4. Click "Graph" again to stop the simulation

### Behaviour
1. Any shapes connected with arrows are included in the graph layout (this extends to videos, frames, and all other shapes)
2. When you select a shape, it will be "fixed" so you can move it around. Deselect to unfreeze.
3. Making a shape red will fix it in place
4. Light blue arrows create an alignment constraint between two shapes

# Contributing
Please open an issue or PR if you have any suggestions or improvements! Especially looking for:
- Refactoring (it's a rushed job, sorry!)
- Performance improvements & bug fixes
- More interesting constraint demonstrations

## Current Limitations
- No support for multiple graph layouts at once
- Rotation is not considered in the layout (PRs welcome!)
- Performance is much poorer than it needs to be, we're currently restarting the layout sim every frame (I know, I know...) and PRs to fix this or otherwise speed things up are very welcome!
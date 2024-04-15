# tldraw graph layout
This repo demonstrates an interactive force-directed graph layout integration with [tldraw](https://github.com/tldraw/tldraw). It uses [WebCola](https://ialab.it.monash.edu/webcola/), a JS port of [libcola](http://www.adaptagrams.org). This repo is aimed to be a starting point for further exploration and there's lots to be explored!

You can mess around with it online [here](https://orionreed.github.io/tldraw-graph-layout/)

https://github.com/OrionReed/tldraw-graph-layout/assets/16704290/0245917d-3a4b-45ad-a3a5-4c6fc4e46a04

## Usage
1. Hit "G" to add/remove all shapes from the graph collection or select shapes and use the "Add" and "Remove" buttons to add just those
2. Move shapes around and watch it go brrrrrrrrrr
3. You can hit the "🔦" button to highlight shapes in the graph

### Behaviour
- Any shapes connected with arrows are included in the graph layout (this extends to videos, frames, and all other shapes)
- When you select a shape, it will be "fixed" so you can move it around. Deselect to unfreeze.

### Constraints
- Making a shape red will fix it in place
- Light blue arrows create an alignment constraint between two shapes
- Much more interesting constraints are possible, PRs welcome!

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
*Note that multiplayer is essentially the same as a single client manually moving many shapes each frame, but it sure is fun! Due to a connection bug I've disabled multiplayer (err, commented out line 25 of App.tsx). PRs for multiplayer fixes/improvements are **very** welcome!

# Contributing
Please open an issue or PR if you have any suggestions or improvements! Especially looking for:
- Architecture / performance improvements / bug fixes
- More interesting constraint demonstrations
- Approaches to proper multiplayer support

## Current Limitations
- Rotation is not considered in the layout (PRs welcome!)
- Performance is **much** poorer than it needs to be, we're currently restarting the layout sim every frame (I know, I know...) and PRs to fix this or otherwise speed things up are very welcome!
- Due to the current edge length calculation, it's possible for the graph to never reach a stable / zero energy state

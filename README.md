# tldraw graph layout
This repo demonstrates an interactive force-directed graph layout integration with [tldraw](https://github.com/tldraw/tldraw). It uses [WebCola](https://ialab.it.monash.edu/webcola/), a JS port of [libcola](http://www.adaptagrams.org). This repo is aimed to be a starting point for further exploration and there's lots to be explored!

You can mess around with it online [here](https://orionreed.github.io/tldraw-graph-layout/)

https://github.com/OrionReed/tldraw-graph-layout/assets/16704290/0245917d-3a4b-45ad-a3a5-4c6fc4e46a04

## Usage
1. Hit "G" to add/remove all shapes from the graph collection or select shapes and use the "Add" and "Remove" buttons to add just those
2. Move shapes around and watch it go brrrrrrrrrr
3. You can hit the "🔦" button to highlight shapes in the graph

### Behaviour
- *Any* shapes connected with arrows are included in the graph layout (this includes videos, frames, etc)
- While a shape is selected it will not be moved by the graph layout. Deselect to let those shapes move.

### Constraints
- Making a shape red will constrain it vertically
- Making a shape blue will constrain it horizontally
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
- More interesting constraint demonstrations
- Improvements to the [collections system](https://github.com/OrionReed/tldraw-graph-layout/tree/main/tldraw-collections)
- Bug fixes / performance improvements

## Current Limitations & Issues
- There is a bug I cannot identify where the non-overlap constraint does not apply to disconnected nodes. They *should* collide with each other but don't.
- Due to the current edge length calculation, it's possible for the graph to never reach a stable / zero energy state under some circumstances. This is just me doing bad math. A better ideal edge length function would be nice.

# DBoard

DBoard free, Open Source **data modeling application** for creating [Entity-Relationship Diagrams](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model) in the browser.
It lets you draw entities, their attributes, and their relationships with each other.
Documents are stored in annotated SVG files, so they can be viewed in regalar web browesers and easily embedded into other documents.

![screenshot](https://github.com/Terrier-Tech/DBoard/raw/master/src/resources/png/screenshot.png)

You can use DBoard online here:

https://terrier-tech.github.io/DBoard/

**Everything is done client-side**, so there's no need to create an account or store your information with a third party. 
Documents can be saved to your browser's local storage or downloaded as SVG images with embedded metadata allowing them to be loaded and edited later.

Current features:

* Drag/drop placement of entites
* Keyboard-focused entry of attributes and their types
* A snap grid system and guides for easy layout and alignment
* Full undo/redo support
* Select from a palette of entity colors


## Running on localhost

First install dependencies:

```sh
npm install
```

To run in hot module reloading mode:

```sh
npm run dev
```

Open http://localhost:3000/DBoard/ in your browser


## Building 

To create a production build:

```sh
npm run build
```

The production artifacts are created in the /docs directory for Github Pages reasons.


## Credit

DBoard is a project of Terrier Technologies (http://terrier.tech).
We hope you find it useful!


## License

DBoard is licensed under the GPL v3.




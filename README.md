# Chicago Million Dollar Blocks

This repo contains code for the Chicago Million Dollar Blocks [website](https://chicagosmilliondollarblocks.com/). This project relies on analysis of incarceration spending in Chicago, which you can find in the [million-dollar-blocks-analysis](https://github.com/datamade/million-dollar-blocks-analysis) repo.

## Setup
Fork the repository, and then clone it to your local machine.

``` bash
git clone git@github.com:datamade/million-dollar-blocks.git
cd million-dollar-blocks
```

We built this site with [Jekyll](https://jekyllrb.com/). Install it:

```bash
gem install jekyll bundler
```
To run the site locally: 
```bash
jekyll serve -w
```

Then, navigate to http://localhost:5000/.

## Dependencies
We used the following open source tools:

* [Bootstrap](https://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Maplibre-GL](https://maplibre.org/maplibre-gl-js/docs/) - javascript library interactive maps
* [pako](https://nodeca.github.io/pako/) - for unzipping our GeoJSON map files
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs
* [GitHub pages](https://pages.github.com/) - free static website hosting

## Team

* Forest Gregg, DataMade - developer, data cruncher
* Cathy Deng, DataMade - designer, developer
* Eric van Zanten, DataMade - developer, GIS data
* Derek Eder, DataMade - developer, content
* Dr. Dan Cooper, Adler University - writer and strategist
* Dr. Ryan Lugalia-Hollon - writer and strategist

Thanks to the folks who helped review this, including: the INN Nerds, Hannah Chung, Pat Sier, Christopher Kelly, Yuanqi Wang, Brian Goggin, Sarah Bump, Joel Inwood

## Credits

The original idea and concept for [Million Dollar Blocks](https://www.spatialinformationdesignlab.org/projects.php%3Fid%3D16) came from Laura Kurgan at the [Spatial Information Design Lab](https://www.spatialinformationdesignlab.org/) in collaboration with the [Justice Mapping Center](https://www.justicemapping.org/) in 2006. This project builds on top of their visionary work.

## Patches and Pull Requests

We welcome your ideas! You can make suggestions in the form of [github issues](https://github.com/datamade/million-dollar-blocks/issues) (bug reports, feature requests, general questions), or you can submit a code contribution via a pull request.

How to contribute code:

- Fork the project.
- Make your feature addition or bug fix.
- Send us a pull request with a description of your work! Don't worry if it isn't perfect - think of a PR as a start of a conversation, rather than a finished product.

## Copyright

Copyright (c) 2025 DataMade. Released under the [MIT License](https://github.com/datamade/million-dollar-blocks/blob/main/LICENSE).

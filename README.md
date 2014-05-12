# EITC Works

The Earned Income Tax Credit (EITC) helps people who work but struggle to get by on low wages, while also reducing poverty, increasing tax fairness, and boosting local economies across the state. Doubling the Illinois Earned Income Tax Credit (EITC) from 10 to 20% of the federal EITC is one of the best investments Illinois can make.

This map allows Illinois residents to explore their legislative district and see how EITC effects them.

## Running locally

``` bash
git clone git@github.com:datamade/eitc-map.git
cd large-lots

# to run locally
python -m SimpleHTTPServer
```

navigate to http://localhost:8000/

# Data

Our map was built using open data from Chicago and Cook County:

* [2011 Illinois House Districts](http://ilhousedems.com/redistricting/2011-maps/Legislative_Districts_Public_Act/House%20and%20Senate%20shape%20files.zip)
* [Brookings Tax Year 2012 EITC Interactive](http://www.brookings.edu/research/interactives/eitc)
* [Characteristics of EITC-Eligible Tax Units in 2012 by State](http://www.brookings.edu/research/interactives/~/media/B3EAE3F03D9946A1A506D00405440513.ashx) - Metropolitan Policy Program at Brookings
* EITC Table from IRS Compliance Data Warehouse, Tax Year 2012

# dependencies
We used the following open source tools:

* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs
* [GitHub pages](https://pages.github.com/) - free static website hosting

## Team

* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data merging

## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/eitc-map/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2014 DataMade and Voices for Illinois Children. Released under the [MIT License](https://github.com/datamade/eitc-map/blob/master/LICENSE).